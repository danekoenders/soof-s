import {
  applyParams,
  save,
  ActionOptions,
  CreateChatSessionActionContext,
} from "gadget-server";
import { getCustomer } from "../../../utils/mantle-api/customer";
import { sendUsageChat } from "../../../utils/mantle-api/usageEvents";
import { langgraph } from "../../../services/langgraph";

export const params = {
  myshopifyDomain: {
    type: "string",
    required: true,
  },
};

/**
 * @param { CreateChatSessionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  const chatbot = await api.chatbot.findFirst({
    select: {
      id: true,
      lgAssistant: true,
      shop: {
        id: true,
        mantleApiToken: true,
      },
    },
    filter: {
      shop: {
        myshopifyDomain: { equals: params.myshopifyDomain },
      },
    },
  });

  params.mantleApiToken = chatbot.shop.mantleApiToken;
  const customer = await getCustomer({
    customerApiToken: params.mantleApiToken,
  });

  if (!customer.subscription || !customer.subscription.active) {
    if (customer.usage.FreeChats.currentValue >= 50) {
      throw new Error("Free chat usage has been exceeded");
    }

    params.freeChat = true;
  } else {
    if (
      customer.usage.Chats.currentValue >=
      customer.subscription.plan.features.chats.value
    ) {
      throw new Error("Chat usage has been exceeded");
    }

    params.freeChat = false;
  }

  applyParams(params, record);

  const sessionToken = crypto.randomUUID();
  const refId = await generateReferenceId(api);

  const thread = await langgraph.threads.create({
    metadata: {
      session_token: sessionToken,
      shopify_domain: params.myshopifyDomain,
    },
  });

  const expiresAt = new Date(Date.now() + 1 * 30 * 60 * 1000); // Adding 30 minutes in milliseconds

  if (!sessionToken || !refId || !chatbot || !thread || !expiresAt) {
    throw new Error(
      "Not able to gather all information to create a chat session"
    );
  }

  record.chatbot = { _link: chatbot.id };
  record.shop = { _link: chatbot.shop.id };
  record.token = sessionToken;
  record.ref = refId;
  record.thread = thread.thread_id;
  record.expiresAt = expiresAt;
  record.lgAssistant = chatbot.lgAssistant;

  await save(record);
}

async function generateReferenceId(api) {
  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
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
    throw new Error(
      "Could not generate a unique reference id after several attempts"
    );
  }

  return refId;
}

/**
 * @param { CreateChatSessionActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  const usageEvent = await sendUsageChat({
    customerApiToken: params.mantleApiToken,
    freeChat: params.freeChat,
  });

  if (!usageEvent.success) {
    throw new Error("Failed to send chat usage event");
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
