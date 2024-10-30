import { applyParams, save, ActionOptions, UpdateIntegrationsExactOnlineActionContext } from "gadget-server";

/**
 * @param { UpdateIntegrationsExactOnlineActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
