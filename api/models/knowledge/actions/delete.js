import { deleteRecord, ActionOptions, DeleteKnowledgeActionContext } from "gadget-server";

/**
 * @param { DeleteKnowledgeActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
