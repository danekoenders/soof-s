import { applyParams, save, ActionOptions, CreatePlanActionContext } from "gadget-server";

/**
 * @param { CreatePlanActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
