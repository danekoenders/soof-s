import { applyParams, save, ActionOptions, CreateIntegrationsExactOnlineActionContext } from "gadget-server";

/**
 * @param { CreateIntegrationsExactOnlineActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
