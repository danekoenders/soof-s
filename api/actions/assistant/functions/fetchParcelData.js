import { AssistantFunctionsFetchParcelDataGlobalActionContext } from "gadget-server";

export const params = {
  orderId: { type: "string" },
  email: { type: "string" },
  shopId: { type: "string", required: true },
  orderNamePrefix: { type: "string" },
  orderNameSuffix: { type: "string" },
};

/**
 * @param { AssistantFunctionsFetchParcelDataGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  const {
    orderId: rawOrderId,
    email,
    shopId,
    orderNamePrefix,
    orderNameSuffix,
  } = params;
  let orderId = rawOrderId;

  if (orderId) {
    orderId = sanitizeOrderId(orderId, orderNamePrefix, orderNameSuffix);
  }

  if (orderId) {
    const response = await getOrder({ api, identifier: { orderId }, shopId });
    return response;
  } else if (email) {
    const response = await getOrder({ api, identifier: { email }, shopId });
    return response;
  } else {
    return {
      success: false,
      status: "No order ID and/or email provided.",
    };
  }
}

/**
 * @param {string} orderId - The raw order ID.
 * @param {string} [prefix] - The prefix to remove.
 * @param {string} [suffix] - The suffix to remove.
 * @returns {string} - The sanitized order ID.
 */
function sanitizeOrderId(orderId, prefix, suffix) {
  if (prefix && orderId.startsWith(prefix)) {
    orderId = orderId.slice(prefix.length);
  }

  if (suffix && orderId.endsWith(suffix)) {
    orderId = orderId.slice(0, -suffix.length);
  }

  return orderId;
}

async function getOrder({ api, identifier, shopId }) {
  const { orderId, email } = identifier;

  const selectFields = {
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
  };

  let filter;
  if (orderId) {
    filter = {
      AND: [
        { shopId: { equals: shopId } },
        { orderNumber: { equals: parseInt(orderId, 10) } },
      ],
    };
  } else if (email) {
    filter = {
      AND: [
        { shopId: { equals: shopId } },
        { email: { equals: email } },
      ],
    };
  } else {
    return {
      success: false,
      status: "Invalid query parameters.",
      tracking: false,
    };
  }

  try {
    const order = await api.shopifyOrder.maybeFindFirst({
      select: selectFields,
      filter,
    });

    if (order) {
      const sanitizedOrderStatusUrl = sanitizeOrderStatusUrl(order.orderStatusUrl);
      return {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatusUrl: sanitizedOrderStatusUrl,
          financialStatus: order.financialStatus,
          currentTotalPrice: order.currentTotalPrice,
        },
        tracking: order.fulfillments.edges.length > 0,
      };
    } else {
      return {
        success: false,
        status: "No order found.",
        tracking: false,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: `Error fetching order: ${error.message}`,
      tracking: false,
    };
  }
}

function sanitizeOrderStatusUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const pathnameSegments = parsedUrl.pathname.split('/');
    const authenticateIndex = pathnameSegments.findIndex(segment => segment === 'authenticate');

    if (authenticateIndex !== -1) {
      parsedUrl.pathname = pathnameSegments.slice(0, authenticateIndex).join('/');
    }

    parsedUrl.search = '';

    return parsedUrl.toString();
  } catch (error) {
    throw new Error(`Error sanitizing order status URL: ${error.message}`);
  }
}