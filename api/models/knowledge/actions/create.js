import { applyParams, save, ActionOptions, CreateKnowledgeActionContext } from "gadget-server";

/**
 * @param { CreateKnowledgeActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
