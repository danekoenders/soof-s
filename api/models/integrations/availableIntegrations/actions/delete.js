import { deleteRecord, ActionOptions, DeleteIntegrationsAvailableIntegrationsActionContext } from "gadget-server";

/**
 * @param { DeleteIntegrationsAvailableIntegrationsActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
