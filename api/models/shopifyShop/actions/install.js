import { applyParams, save, ActionOptions, InstallShopifyShopActionContext } from "gadget-server";
import { identifyShop } from '../../../services/mantle';

/**
 * @param { InstallShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { InstallShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  await identifyShop({
    shop: record,
    api,
  });

  const planRecord = await api.plan.create({
    shop: {
      _link: record.id,
    },
  })

  const knowledgeRecord = await api.knowledge.create({
    shop: {
      _link: record.id,
    },
  })

  const availableIntegrationsRecord = await api.integrations.availableIntegrations.create({
    shop: {
      _link: record.id,
    }
  });

  const exactOnlineRecord = await api.integrations.exactOnline.create({
    shop: {
      _link: record.id,
    },
    state: "no-token",
  })

  const chatbotRecord = await api.chatbot.create({
    shop: {
      _link: record.id,
    },
  });

  if (!planRecord || !availableIntegrationsRecord || !exactOnlineRecord || !knowledgeRecord || !chatbotRecord) {
    throw new Error("Failed to create records");
  }
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
