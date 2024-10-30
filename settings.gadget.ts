import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.3.0",
  plugins: {
    connections: {
      sentry: true,
      shopify: {
        apiVersion: "2024-10",
        enabledModels: [
          "shopifyCollection",
          "shopifyFulfillment",
          "shopifyOrder",
          "shopifyProduct",
          "shopifyProductImage",
          "shopifyProductOption",
          "shopifyProductVariant",
        ],
        type: "partner",
        scopes: ["read_products", "read_orders", "read_fulfillments"],
      },
      openai: true,
    },
  },
};
