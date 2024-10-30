import { FetchParcelDataGlobalActionContext, DefaultEmailTemplates } from "gadget-server";
import { bridgeApi } from "../utils/bridgeApi";

/**
 * @param { FetchParcelDataGlobalActionContext } context
 */

export const params = {
  orderId: { type: "string" },
  email: { type: "string" },
  shopId: { type: "string", required: true },
};

export async function run({ params, logger, api, connections }) {
  let orderId = params.orderId;
  if (orderId.startsWith("#")) {
    orderId = orderId.slice(1);
  }

  if (params.orderId) {
    const response = await getOrder({ orderId, shopId: params.shopId });
    return response;

  } else if (params.email) {
    const response = await getOrder({ email: params.email, shopId: params.shopId });
    return response;

  } else {
    return ({
      success: false,
      status: "No order ID and/or email provided."
    });
  }
};

async function getOrder({ orderId, email, shopId }) {
  if (orderId) {
    const order = await bridgeApi.shopifyOrder.maybeFindFirst({
      select: {
        id: true,
        fulfillmentStatus: true,
        orderStatusUrl: true,
        financialStatus: true,
        currentTotalPrice: true,
        orderNumber: true,
        email: true,
        fulfillments: {
          edges: {
            node: {
              id: true,
              shipmentStatus: true,
              status: true,
              trackingNumbers: true,
              trackingUrls: true,
            },
          },
        },
      },
      filter: {
        AND: [
          { orderNumber: { equals: parseInt(orderId) } },
          { shopId: { equals: shopId } },
        ],
      }
    })

    if (order) {
      return ({
        success: true,
        order: order,
        tracking: order.fulfillments.edges.length > 0,
      })
    } else {
      return ({
        success: false,
        status: "No order found with that ID",
        tracking: order.fulfillments.edges.length > 0,
      });
    }
  } else if (email) {
    const order = await bridgeApi.shopifyOrder.maybeFindFirst({
      select: {
        id: true,
        fulfillmentStatus: true,
        orderStatusUrl: true,
        financialStatus: true,
        currentTotalPrice: true,
        orderNumber: true,
        email: true,
        fulfillments: {
          edges: {
            node: {
              id: true,
              shipmentStatus: true,
              status: true,
              trackingNumbers: true,
              trackingUrls: true,
            },
          },
        },
      },
      filter: {
        AND: [
          { email: { equals: email } },
          { shopId: { equals: shopId } },
        ],
      }
    })

    if (order) {
      return ({
        success: true,
        order: order,
        tracking: order.fulfillments.edges.length > 0,
      })
    } else {
      return ({
        success: false,
        status: "No order found with that email",
        tracking: order.fulfillments.edges.length > 0,
      });
    }
  }
}