import { applyParams, save, ActionOptions, CreateChatSessionActionContext } from "gadget-server";
import { v4 as uuidv4 } from 'uuid';

/**
 * @param { CreateChatSessionActionContext } context
 */

export const params = {
  origin: {
    type: "string",
    required: true,
  },
};

export async function run({ params, record, logger, api, connections }) {
  const chatbot = await api.chatbot.findFirst({
    select: {
      id: true,
      assistant: true,
      shop: {
        id: true,
        plan: {
          id: true,
          chats: true,
          chatLimit: true,
          activePlan: true,
          trialDays: true,
        }
      },
    },
    filter: {
      shop: {
        myshopifyDomain: { equals: params.origin }
      }
    }
  });

  if (!chatbot.shop.plan.currentPlan && chatbot.shop.plan.trialDays === 0) {
    throw new Error("Plan is not active");
  }

  if (chatbot.shop.plan.chats >= chatbot.shop.plan.chatLimit) {
    throw new Error("Chat limit exceeded");
  }

  applyParams(params, record);

  const sessionToken = uuidv4();
  const refId = await generateReferenceId(api);
  params.plan = {
    id: chatbot.shop.plan.id,
  }

  const thread = await connections.openai.beta.threads.create({}, {
    headers: {
      "OpenAI-Beta": "assistants=v2",
    }
  });

  const expiresAt = new Date(Date.now() + (1 * 30 * 60 * 1000)); // Adding 30 minutes in milliseconds

  if (!sessionToken || !refId || !chatbot || !thread || !expiresAt) {
    throw new Error("Not able to gather all information to create a chat session");
  }

  record.chatbot = { _link: chatbot.id };
  record.shop = { _link: chatbot.shop.id };
  record.token = sessionToken;
  record.ref = refId;
  record.thread = thread.id;
  record.assistant = chatbot.assistant;
  record.expiresAt = expiresAt;

  await save(record);
};

async function generateReferenceId(api) {
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  let refId;
  let checkRefId;
  let maxRetries = 20;

  do {
    refId = generateRandomString(5);
    checkRefId = await api.chatSession.maybeFindByRef(refId);

    if (checkRefId) {
      maxRetries--;
    }
  } while (checkRefId && maxRetries > 0);

  if (checkRefId) {
    throw new Error("Could not generate a unique reference id after several attempts");
  }

  return refId;
}

/**
 * @param { CreateChatSessionActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  await api.plan.update(params.plan.id, {
    chats: params.plan.chats + 1,
  })
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
