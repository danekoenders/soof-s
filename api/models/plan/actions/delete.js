import { deleteRecord, ActionOptions, DeletePlanActionContext } from "gadget-server";

/**
 * @param { DeletePlanActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
