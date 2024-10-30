import { applyParams, save, ActionOptions, UpdateKnowledgeActionContext } from "gadget-server";

/**
 * @param { UpdateKnowledgeActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
