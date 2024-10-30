import { applyParams, save, ActionOptions, UpdateChatSessionActionContext } from "gadget-server";

/**
 * @param { UpdateChatSessionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
