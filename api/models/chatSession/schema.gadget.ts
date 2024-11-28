import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "chatSession" model, go to https://soof-s.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "KmC-SMD35L20",
  fields: {
    chatbot: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "chatbot" },
      storageKey: "rpkoSJP2v0Ut",
    },
    email: { type: "email", storageKey: "aV3PNmIpim6F" },
    expiresAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "y7JeWGy-QiTE",
    },
    localLanguage: {
      type: "string",
      validations: {
        required: true,
        stringLength: { min: 1, max: 5 },
      },
      storageKey: "tAfkOQIuZxRG",
    },
    ref: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "3gN27zTOm95M",
    },
    rlIsLimited: { type: "boolean", storageKey: "66kfduCuhhGL" },
    rlLastMessageTimestamp: {
      type: "dateTime",
      includeTime: true,
      storageKey: "OY_WK0eCUrrt",
    },
    rlMessageCount: {
      type: "number",
      default: 0,
      decimals: 0,
      storageKey: "Zn0qAQsuxqum",
    },
    shop: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "shopifyShop" },
      storageKey: "_DNZHOY2CFpU",
    },
    thread: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "QpHXZ7OH4gLw",
    },
    token: {
      type: "string",
      validations: {
        required: true,
        unique: { caseSensitive: true },
      },
      storageKey: "olm01nOlkMqj",
    },
    transcript: { type: "json", storageKey: "d2BAfbUHqraO" },
  },
};
