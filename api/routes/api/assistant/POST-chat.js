import { RouteContext } from "gadget-server";
import { verifySignature } from "../../../utils/shopify-proxy/signature";

/**
 * Route handler for GET chat
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
  if (!verifySignature(request.query)) {
    throw new Error("Unauthorized");
  }

  const params = request.body;

  try {
    const session = await api.chatSession.findByToken(params.sessionToken, {
      select: {
        id: true,
        email: true,
        assistant: true,
        transcript: true,
        rlIsLimited: true,
        rlLastMessageTimestamp: true,
        rlMessageCount: true,
        shop: {
          id: true,
          customName: true,
          shopifyShopId: true,
        },
        thread: true,
        expiresAt: true,
      },
    });

    if (!isValidSessionToken(session, logger)) {
      throw new Error("Invalid or expired session token");
    }

    if (session.rlIsLimited) {
      throw new Error('Rate limit exceeded. Please wait before sending more messages.');
    }

    const thread = session.thread;
    let runCompleted = false;
    let response;

    if (params.functionObj) {
      const functionResponse = await api.assistant.functions[params.functionObj.name]({
        session: session,
        functionParams: params.functionObj.params,
      });

      if (functionResponse.success) {
        response = await handleResponse({
          connections: connections,
          thread: thread,
          type: 'frontEndFunction',
          output: functionResponse,
        });
      }
    } else if (params.message) {
      // Beginning OpenAI request
      await connections.openai.beta.threads.messages.create(
        thread,
        { role: "user", content: params.message }
      );

      const run = await connections.openai.beta.threads.runs.create(
        thread,
        { assistant_id: session.assistant }
      );

      do {
        const runRetrieve = await connections.openai.beta.threads.runs.retrieve(
          thread,
          run.id
        );

        if (runRetrieve.status === "completed") {
          response = await handleResponse({
            connections: connections,
            thread: thread,
            run: run,
            type: "normal",
            logger: logger,
          });
          runCompleted = true;

        } else if (runRetrieve.status === "requires_action") {
          const requiredActions = runRetrieve.required_action.submit_tool_outputs.tool_calls;

          let toolsOutput = [];
          let type;
          let finalOutput;

          for (const action of requiredActions) {
            const funcName = action.function.name;
            const funcArguments = JSON.parse(action.function.arguments);

            if (funcName === "fetchParcelDataByOrderId" || funcName === "fetchParcelDataByEmail") {
              type = "fetchParcelData";

              if (funcName === "fetchParcelDataByOrderId") {
                finalOutput = await api.assistant.functions.fetchParcelData({
                  orderId: funcArguments.orderId,
                  shopId: session.shop.shopifyShopId,
                });
              } else if (funcName === "fetchParcelDataByEmail") {
                finalOutput = await api.assistant.functions.fetchParcelData({
                  email: session.email,
                  shopId: session.shop.shopifyShopId,
                });
              }
              toolsOutput.push({
                tool_call_id: action.id,
                output: JSON.stringify(finalOutput),
              });

            } else if (funcName === "fetchProductRecommendation") {
              type = "productRecommendation"
              finalOutput = await api.assistant.functions.fetchProductData(
                {
                  type: "productRecommendation",
                  shopifyShopId: session.shop.shopifyShopId,
                  searchQuery: funcArguments.searchQuery,
                }
              );
              toolsOutput.push({
                tool_call_id: action.id,
                output: JSON.stringify(finalOutput),
              });

            } else if (funcName === "fetchProductByTitle") {
              type = "normal"
              finalOutput = await api.assistant.functions.fetchProductData(
                {
                  type: "productByTitle",
                  shopifyShopId: session.shop.shopifyShopId,
                  title: funcArguments.title,
                }
              );
              toolsOutput.push({
                tool_call_id: action.id,
                output: JSON.stringify(finalOutput),
              });

            } else if (funcName === "sendToCustomerSupport") {
              type = "normal"
              finalOutput = await api.assistant.functions.sendTranscript({
                sessionId: session.id,
                lastMessage: params.message
              });
              toolsOutput.push({
                tool_call_id: action.id,
                output: JSON.stringify(finalOutput),
              });

            } else if (funcName === "sendInvoice") {
              type = "normal"
              finalOutput = await api.assistant.functions.sendInvoice({
                orderId: funcArguments.orderId,
                shopId: session.shop.id,
                shopifyShopId: session.shop.shopifyShopId,
              });
              toolsOutput.push({
                tool_call_id: action.id,
                output: JSON.stringify(finalOutput),
              });

            } else if (funcName === "multi_tool_use") {
              await connections.openai.beta.threads.runs.cancel(
                thread,
                run.id
              );
              throw new Error("Function: " + funcName);

            } else {
              await connections.openai.beta.threads.runs.cancel(
                thread,
                run.id
              );
              throw new Error("Unknown function: " + funcName);
            }
          }

          await connections.openai.beta.threads.runs.submitToolOutputs(
            thread,
            run.id,
            { tool_outputs: toolsOutput }
          );

          response = await handleResponse({
            connections: connections,
            thread: thread,
            run: run,
            type: type,
            output: finalOutput,
            logger: logger,
          });
          runCompleted = true;

        } else if (runRetrieve.status === "failed") {
          await connections.openai.beta.threads.runs.cancel(
            thread,
            run.id
          );
          throw new Error("Run failed");
        } else {
          await delay(200);
        }
      } while (!runCompleted);
      // End of OpenAI request
    }

    if (!response) {
      throw new Error("No response found");
    } else {
      // Valid Response
      await updateSession({
        api,
        session,
        userMessage: params.message || params.functionObj.name,
        assistantMessage: response
      });

      reply.headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      });

      return reply.type("application/json").send(response);
    }
  } catch (error) {
    throw new Error(error.message); // To capture and rethrow the exact error message
  }
}

async function handleResponse(params) {
  if (params.type === "normal") {
    let reply;
    let maxRetries = 50;

    do {
      const messages = await params.connections.openai.beta.threads.messages.list(params.thread);
      const lastMessageForRun = messages.data
        .filter(message => message.run_id === params.run.id && message.role === "assistant")
        .pop();

      if (lastMessageForRun && lastMessageForRun.content?.length > 0 && lastMessageForRun.content[0].text) {
        reply = lastMessageForRun.content[0].text.value;
      }

      if (reply) break;

      await delay(200);
    } while (!reply && maxRetries-- > 0);

    if (reply) {
      return {
        type: params.type,
        reply: reply,
        options: params.options,
      };
    } else {
      await params.connections.openai.beta.threads.runs.cancel(
        params.thread,
        params.run.id
      );
      throw new Error(`No reply found after fetching`);
    }
  } else if (params.type === "frontEndFunction") {
    return {
      type: params.type,
      reply: params.functionOutput,
    };
  } else if (params.type === "fetchParcelData") {
    if (params.output.success === true) {
      if (params.output.tracking) {
        return {
          type: "orderTracking",
          order: params.output.order,
          options: [
            {
              label: "Stuur Tracking",
              function: {
                name: "sendOrderTracking",
                params: {
                  orderId: params.output.order.id,
                }
              },
            },
            { label: "Details", function: { name: "viewOrderDetails" } },
          ],
        };
      } else {
        return {
          type: "orderTracking",
          order: params.output.order,
          options: [
            { label: "Details", function: { name: "viewOrderDetails" } },
          ],
        };
      }
    } else if (params.output.success === false) {
      return await handleResponse({
        connections: params.connections,
        thread: params.thread,
        run: params.run,
        type: "normal",
        logger: params.logger,
      });
    }
  } else if (params.type === "productRecommendation") {
    if (params.output.status === "success") {
      return {
        type: params.type,
        products: params.output.products,
      };
    } else if (params.output.status === "failed") {
      return await handleResponse({
        connections: params.connections,
        thread: params.thread,
        run: params.run,
        type: "normal",
        options: [
          { label: "Wat bieden jullie aan?", value: "Wat voor producten bieden jullie aan?" },
        ],
        logger: params.logger,
      });
    }
  } else {
    await params.connections.openai.beta.threads.runs.cancel(
      params.thread,
      params.run.id
    );
    throw new Error("Unknown type of response");
  }
}

async function updateSession({ api, session, userMessage, assistantMessage }) {
  const currentTime = new Date();
  const TIME_WINDOW = 1 * 60 * 1000;
  const RATE_LIMIT = 10;

  const lastMessageTime = session.rlLastMessageTimestamp ? new Date(session.rlLastMessageTimestamp) : null;
  let messageCount = session.rlMessageCount || 0;

  if (lastMessageTime && (currentTime - lastMessageTime) <= TIME_WINDOW) {
    messageCount += 1;
  } else {
    messageCount = 1;
  }

  const isRateLimited = messageCount > RATE_LIMIT;

  if (isRateLimited) {
    await api.chatSession.update(session.id, {
      rlMessageCount: messageCount,
      rlLastMessageTimestamp: currentTime.toISOString(),
      rlIsLimited: true,
    });

    // TODO: Send a message to the front-end to handle use GPT01-preview
    throw new Error('Rate limit exceeded. Please wait before sending more messages.');
  }

  const newUserMessage = {
    role: "user",
    message: userMessage,
    timestamp: currentTime.toISOString(),
  };
  const newAssistantMessage = {
    role: "assistant",
    message: assistantMessage,
    timestamp: currentTime.toISOString(),
  };

  let currentTranscript = session.transcript ? JSON.parse(session.transcript) : [];
  currentTranscript.push(newUserMessage, newAssistantMessage);

  await api.chatSession.update(session.id, {
    transcript: JSON.stringify(currentTranscript),
    rlMessageCount: messageCount,
    rlLastMessageTimestamp: currentTime.toISOString(),
    rlIsLimited: false,
  });
}

function isValidSessionToken(session, logger) {
  if (!session) {
    logger.error('No session found');
    return false;
  } else if (!session.thread) {
    logger.error('No thread found for session');
    return false;
  }

  const currentTime = new Date();
  const expirationTime = new Date(session.expiresAt);

  return currentTime <= expirationTime;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}