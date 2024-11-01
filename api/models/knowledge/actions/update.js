import { applyParams, save, ActionOptions, UpdateKnowledgeActionContext } from "gadget-server";

export const params = {
  chatbotId: {
    type: "string",
  },
};

/**
 * @param { UpdateKnowledgeActionContext } context
 */
export async function run({ params, record, logger, api, connections, session }) {
  if (session) {
    const sessionShopId = session.get('shop');
    applyParams(params, record);

    if (record.shopId !== sessionShopId) {
      throw new Error("You are not authorized to update knowledge for this shop");
    }
  } else {
    applyParams(params, record);
  }

  await save(record);
};

/**
 * @param { UpdateKnowledgeActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections, session }) {
  let updateChatbot;

  if (session) {
    const sessionShopId = session.get('shop');
    const shop = await api.shopifyShop.findOne(sessionShopId, {
      select: {
        chatbot: {
          id: true,
        }
      }
    })

    updateChatbot = await api.chatbot.update(shop.chatbot.id)
  } else {
    updateChatbot = await api.chatbot.update(params.chatbotId)
  }

  if (!updateChatbot) {
    throw new Error("Failed to update chatbot");
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
