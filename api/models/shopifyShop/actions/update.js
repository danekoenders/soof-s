import { applyParams, preventCrossShopDataAccess, save, ActionOptions, UpdateShopifyShopActionContext } from "gadget-server";
import { identifyShop } from '../../../services/mantle'

export const params = {
  doSync: { type: 'boolean' },
};

/**
 * @param { UpdateShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api, connections, session }) {
  if (session) {
    const sessionShopId = session.get('shop');

    if (sessionShopId !== record.id) {
      throw new Error('Unauthorized');
    }

    if (params.doSync && record.setupCompleted === false) {
      const shopifySyncRecord = await api.shopifySync.run({
        domain: record.myshopifyDomain,
        shop: {
          _link: record.id,
        },
        models: ["shopifyProduct", "shopifyProductImage", "shopifyProductOption", "shopifyProductVariant", "shopifyOrder"],
      });

      if (!shopifySyncRecord) {
        throw new Error("Failed to sync Shopify data");
      }
    }

    record.orderNamePrefix = params.shopifyShop.orderNamePrefix;
    record.orderNameSuffix = params.shopifyShop.orderNameSuffix;
    record.setupCompleted = params.shopifyShop.setupCompleted;
  } else {
    applyParams(params, record);
  }

  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections, session }) {
  await identifyShop({
    shop: record,
    api,
  });
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
