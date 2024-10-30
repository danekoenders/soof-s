import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "knowledge" model, go to https://soof-s.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "fVbtiSfWKReF",
  fields: {
    deliveryAmount: { type: "string", storageKey: "BLWGo2uX3rGn" },
    deliveryCountries: { type: "json", storageKey: "5K3XR9jdFbtD" },
    freeDeliveryAmount: {
      type: "string",
      storageKey: "F7g3MTTTuqLB",
    },
    maxDeliveryDays: {
      type: "number",
      decimals: 0,
      storageKey: "t8Kh9OzCYYgw",
    },
    minDeliveryDays: {
      type: "number",
      decimals: 0,
      storageKey: "zcaOx9BnvXKS",
    },
    paymentOptions: { type: "string", storageKey: "lokD92gZDU9H" },
    popularProducts: { type: "json", storageKey: "zBQ3t_OErE_F" },
    productCategory: { type: "string", storageKey: "3xgOraAxkNea" },
    returnAddress: { type: "string", storageKey: "-iD6j7wXy_qR" },
    returnAndRefundPolicy: {
      type: "string",
      storageKey: "ijTxcN5o60WO",
    },
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "eCCJAAkn2hGc",
    },
  },
};
