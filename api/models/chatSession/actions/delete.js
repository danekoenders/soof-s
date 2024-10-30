import { deleteRecord, ActionOptions, DeleteChatSessionActionContext } from "gadget-server";

/**
 * @param { DeleteChatSessionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
