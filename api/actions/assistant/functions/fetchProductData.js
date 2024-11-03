import { AssistantFunctionsFetchProductDataGlobalActionContext } from "gadget-server";
import { productRecommendation } from "../../../utils/productSearch/recommendation";
import { productByTitle } from "../../../utils/productSearch/title";

export const params = {
  type: { type: "string" },
  shopId: { type: "string" },
  searchQuery: { type: "string" },
  title: { type: "string" }
};

/**
 * @param { AssistantFunctionsFetchProductDataGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  if (params.type === "productRecommendation") {
    const response = await productRecommendation({ api, logger, connections, shopId: params.shopId, searchQuery: params.searchQuery });
    return response;
  } else if (params.type === "productByTitle") {
    const response = await productByTitle({ api, logger, connections, shopId: params.shopId, title: params.title });
    return response;
  } else {
    throw new Error("Unknown function");
  }
};