import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "integrations/exactOnline" model, go to https://soof-s.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "Lz-Yn5L8piC2",
  fields: {
    accessToken: {
      type: "encryptedString",
      storageKey: "GTgku1q4WF0y::String-GTgku1q4WF0y",
    },
    accessTokenExpiresAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "GV_O8up1PKZd",
    },
    refreshToken: {
      type: "encryptedString",
      storageKey: "ar1CyPd4BjCj::String-ar1CyPd4BjCj",
    },
    refreshTokenExpiresAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "HR4fKeRzpLAV",
    },
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "QhUI-_PMcBSB",
    },
    state: {
      type: "string",
      default: "no-token",
      validations: { required: true },
      storageKey: "pKq9nckmc_65",
    },
  },
};
