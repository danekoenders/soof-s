import { UtilsFetchShopPoliciesGlobalActionContext } from "gadget-server";

export const params = {
  shopId: {
    type: "string",
  },
};

/**
 * @param { UtilsFetchShopPoliciesGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {

};

/**
 * @param { UtilsFetchShopPoliciesGlobalActionContext } context
 */
export async function onSuccess({ params, logger, api, connections }) {
  if (params.shopId) {
    await connections.shopify.setCurrentShop(params.shopId);
  }
  const shopify = connections.shopify.current;

  if (shopify) {
    // use the client to make the GraphQL call
    const test = await shopify.graphql(`
      query {
        shop {
          shopPolicies {
            id
            title
            body
            url
          }
        }
      }
    `);

    logger.info(test);
  } else {
    logger.error("No Shopify connection found");
  }
};
