import { FetchProductDataGlobalActionContext, logger } from "gadget-server";

export const params = {
  type: { type: "string" },
  shopifyShopId: { type: "string" },
  searchQuery: { type: "string" },
  title: { type: "string" }
};

/**
 * @param { FetchProductDataGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  if (params.type === "productRecommendation") {
    const response = await productRecommendation(logger, params.shopifyShopId, params.searchQuery);
    return response;
  } else if (params.type === "productByTitle") {
    const response = await productByTitle(params.shopifyShopId, params.title);
    return response;
  } else {
    throw new Error("Unknown function");
  }
};

async function productRecommendation(logger, shopifyShopId, searchQuery) {
  try {
    const url = `${process.env.SHOPIFY_APP_DOMAIN}/api/product/recommendation?searchQuery=${encodeURIComponent(searchQuery)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': process.env.SHOPIFY_APP_AUTH,
        "X-Shopify-Shop-Id": shopifyShopId,
      }
    });

    if (!response.ok) {
      throw new Error(`Check Soof Shopify Bridge logs.`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching product recommendation: ${error}`);
  }
}

async function productByTitle(shopifyShopId, title) {
  try {
    const url = `${process.env.SHOPIFY_APP_DOMAIN}/api/product/title?title=${encodeURIComponent(title)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': process.env.SHOPIFY_APP_AUTH,
        "X-Shopify-Shop-Id": shopifyShopId,
      }
    });

    if (!response.ok) {
      throw new Error(`Check Soof Shopify Bridge logs.`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching product by title: ${error}`);
  }
}