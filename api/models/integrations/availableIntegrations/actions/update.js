import { applyParams, save, ActionOptions, UpdateIntegrationsAvailableIntegrationsActionContext } from "gadget-server";

/**
 * @param { UpdateIntegrationsAvailableIntegrationsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
