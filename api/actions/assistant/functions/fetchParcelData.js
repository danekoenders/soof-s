import { AssistantFunctionsFetchParcelDataGlobalActionContext } from "gadget-server";

export const params = {
  orderId: { type: "string" },
  email: { type: "string" },
  shopId: { type: "string", required: true },
};

/**
 * @param { AssistantFunctionsFetchParcelDataGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  let orderId = params.orderId;

  if (orderId) {
    if (orderId.startsWith("#")) {
      orderId = orderId.slice(1);
    }

    const response = await getOrder({ api, orderId, shopId: params.shopId });
    return response;

  } else if (params.email) {
    const response = await getOrder({ api, email: params.email, shopId: params.shopId });
    return response;

  } else {
    return ({
      success: false,
      status: "No order ID and/or email provided."
    });
  }
};

async function getOrder({ api, orderId, email, shopId }) {
  if (orderId) {
    const order = await api.shopifyOrder.maybeFindFirst({
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
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatusUrl: order.orderStatusUrl,
          financialStatus: order.financialStatus,
          currentTotalPrice: order.currentTotalPrice,
        },
        tracking: order.fulfillments.edges.length > 0,
      })
    } else {
      return ({
        success: false,
        status: "No order found with that ID",
        tracking: false,
      });
    }
  } else if (email) {
    const order = await api.shopifyOrder.maybeFindFirst({
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
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatusUrl: order.orderStatusUrl,
          financialStatus: order.financialStatus,
          currentTotalPrice: order.currentTotalPrice,
        },
        tracking: order.fulfillments.edges.length > 0,
      })
    } else {
      return ({
        success: false,
        status: "No order found with that email",
        tracking: false,
      });
    }
  }
}