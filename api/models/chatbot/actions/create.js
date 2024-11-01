import { applyParams, save, ActionOptions, CreateChatbotActionContext } from "gadget-server";

/**
 * @param { CreateChatbotActionContext } context
 */
export async function run({ params, record, logger, api, connections, session }) {
  applyParams(params, record);

  record.functions = {
    sendToCustomerSupport: true,
    fetchProductRecommendation: true,
    fetchProductByTitle: true,
    fetchParcelDataByEmail: true,
    fetchParcelDataByOrderId: true,
    sendInvoice: false,
  };

  await save(record);
};

/**
 * @param { CreateChatbotActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  const shop = await api.shopifyShop.findOne(record.shopId, {
    select: {
      name: true,
      knowledge: {
        paymentOptions: true,
        productCategory: true,
        popularProducts: true,
        returnAddress: true,
        minDeliveryDays: true,
        maxDeliveryDays: true,
        deliveryCountries: true,
        returnAndRefundPolicy: true,
        deliveryAmount: true,
        freeDeliveryAmount: true,
      },
      availableIntegrations: {
        exactOnline: true,
      }
    },
  });

  let formattedPopularProducts;
  let formattedDeliveryCountries;

  if (shop.knowledge.popularProducts) {
    formattedPopularProducts = shop.knowledge.popularProducts.map(product => `${product.title}`).join(", ");
  }

  if (shop.knowledge.deliveryCountries) {
    formattedDeliveryCountries = shop.knowledge.deliveryCountries?.map(deliveryCountry => `${deliveryCountry}`).join(", ");
  }

  const functions = {
    fetchParcelDataByOrderId: {
      enabled: true,
      function: {
        name: "fetchParcelDataByOrderId",
        description: "Send latest delivery information of a specific order to the customer. The order ID is required in order to fetch this data.",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "The order ID related to the order"
            }
          },
          additionalProperties: false,
          required: [
            "orderId"
          ]
        }
      }
    },
    fetchProductRecommendation: {
      enabled: true,
      function: {
        name: "fetchProductRecommendation",
        description: "Fetch products for a product recommendation based on a search query. Sometimes it will be best to use the sentence that the user asks the question with.",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            searchQuery: {
              type: "string",
              description: "The search query for the recommendation"
            }
          },
          additionalProperties: false,
          required: [
            "searchQuery"
          ]
        }
      }
    },
    sendToCustomerSupport: {
      enabled: true,
      function: {
        name: "sendToCustomerSupport",
        description: "Send the messages of this chat to the customer support team so that they are able to help this customer further. Only do this when the context of the question is clear.",
        strict: true,
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: []
        }
      }
    },
    fetchParcelDataByEmail: {
      enabled: true,
      function: {
        name: "fetchParcelDataByEmail",
        description: "Send latest delivery information of the latest order, associated with this email address, to the customer. The email address is already provided in the chat session.",
        strict: true,
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: []
        }
      }
    },
    fetchProductByTitle: {
      enabled: true,
      function: {
        name: "fetchProductByTitle",
        description: "Fetch product information by the title of a product.",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the product"
            }
          },
          additionalProperties: false,
          required: [
            "title"
          ]
        }
      }
    },
    sendInvoice: {
      enabled: shop.availableIntegrations.exactOnline,
      function: {
        name: "sendInvoice",
        description: "Send an invoice of an order to a customer. This is an already generated invoice of an order that is sent to the customer by email.",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "The order ID of the corresponding order"
            }
          },
          additionalProperties: false,
          required: [
            "orderId"
          ]
        }
      }
    }
  };

  const assistant = await connections.openai.beta.assistants.create({
    instructions:
      `
      You are a digital customer support assistant called ${record.customName || 'Soof'} for ${shop.name ? `the webshop: ${shop.name}` : 'a webshop'}.
      You are here to help customers with their questions and help them find products in the store.
      Your tone of voice is warm, kind and helpful.
      Never talk with information coming from yourself, only talk about information provided.
      Never talk about other webshops or company's.
      Since you are a chatbot, you keep your messages concise and consistent.
      You have several functions to call and retrieve information.
      Besides these functions you are not able to retrieve any other information.
  
      Message formatting:
      When composing responses, consistently use Markdown formatting to enhance the readability and organisation of the text. This includes:
  
      Headings: Use appropriate heading levels(##, ###, ####) to structure your response clearly.
      Emphasis: Apply bold(** bold **) and italics(* italics *) to highlight key points or terms.
      Lists: Use bulleted(-) or numbered(1.) lists to present multiple points or steps orderly.
      Respond with emoji's where applicable.
  
      General information:
      You can use function calling to retrieve information about certain subjects.
      When you are not able to provide an answer, you can call the sendToCustomerSupport function, first make sure that the context of the question is clear and ask questions if you think that might be helpful for the customer support team.
      The question must be related to the webshop, if not, ask what the question is about.
      You do not have any information about the customer besides the information they provide.
  
      ${shop.knowledge.productCategory && formattedPopularProducts ? `
        Webshop information:
        This webshop sells ${shop.knowledge.productCategory}. The most popular products are: ${formattedPopularProducts}.
      ` : ""}
  
      Payment options:
      ${shop.knowledge.paymentOptions}
      In case the customer wants to pay now using an invoice, you will need to call the sendToCustomerSupport function but first ask what products he / she would like.
  
      Delivery Information:
      Estimated delivery time is ${shop.knowledge.minDeliveryDays || 1} - ${shop.knowledge.maxDeliveryDays || 2} working days. ${shop.knowledge.deliveryCountries ? `The webshop ships to: ${formattedDeliveryCountries}.` : ""} 
      ${shop.knowledge.freeDeliveryAmount ? `When order is above ${shop.knowledge.freeDeliveryAmount} you will not pay any delivery fee, but below ${shop.knowledge.freeDeliveryAmount} the fee will be ${shop.knowledge.deliveryAmount || '$4.95'}. Track and Trace code will be provided and sent to the email when the order is processed.` : `Delivery costs: ${shop.knowledge.deliveryAmount || '$4.95'}`}
  
      ${shop.knowledge.returnAndRefundPolicy ? `Returns & Refunds: ${shop.knowledge.returnAndRefundPolicy}` : ""}
      
      ${shop.knowledge.returnAddress ? `Return address: ${shop.knowledge.returnAddress}` : ""}
    `,
    name: shop.name,
    tools: Object.values(functions)
      .filter(fn => fn.enabled)
      .map(fn => ({
        type: "function",
        function: fn.function
      })),
    model: "gpt-4o-mini",
    response_format: "auto"
  });

  if (!assistant.id) {
    throw new Error("Failed to create assistant");
  }

  record.assistant = assistant.id;
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};