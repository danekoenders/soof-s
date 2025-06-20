import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "chatbot" model, go to https://soof-s.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "D6Pb7QgsXApD",
  fields: {
    assistant: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "4gcCamQmQmnp",
    },
    chatSessions: {
      type: "hasMany",
      children: { model: "chatSession", belongsToField: "chatbot" },
      storageKey: "_mswBZB0waFC",
    },
    customName: { type: "string", storageKey: "GFcVXIhcr_aW" },
    functions: {
      type: "json",
      validations: { required: true },
      storageKey: "9_0FcnkT6kYJ",
    },
    primaryColor: {
      type: "string",
      default: "#0260a8",
      storageKey: "Op126DhQJn6e",
    },
    secondaryColor: {
      type: "string",
      default: "#001937",
      storageKey: "LFiBQ_MvyZi7",
    },
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "cIly4OtiHSoK",
    },
  },
};
