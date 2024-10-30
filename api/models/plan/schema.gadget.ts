import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "plan" model, go to https://soof-s.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "2GDCFI6-hcBR",
  fields: {
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "3UNJZJCEZQZx",
    },
  },
};
