import { applyParams, save, ActionOptions, UpdatePlanActionContext } from "gadget-server";

/**
 * @param { UpdatePlanActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
