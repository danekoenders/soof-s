import { applyParams, save, ActionOptions, CreateIntegrationsAvailableIntegrationsActionContext } from "gadget-server";

/**
 * @param { CreateIntegrationsAvailableIntegrationsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
