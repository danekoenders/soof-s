import { deleteRecord, ActionOptions, DeleteIntegrationsExactOnlineActionContext } from "gadget-server";

/**
 * @param { DeleteIntegrationsExactOnlineActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
