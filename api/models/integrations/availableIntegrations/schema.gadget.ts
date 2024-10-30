import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "integrations/availableIntegrations" model, go to https://soof-s.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "af4_U0ycDgth",
  fields: {
    exactOnline: {
      type: "boolean",
      default: false,
      storageKey: "34MF3QdaeKdw",
    },
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "DCLT6SyicwCV",
    },
  },
};
