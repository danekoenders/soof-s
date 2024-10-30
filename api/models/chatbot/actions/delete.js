import { deleteRecord, ActionOptions, DeleteChatbotActionContext } from "gadget-server";

/**
 * @param { DeleteChatbotActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  const deleteAssistant = await connections.openai.beta.assistants.del(record.assistant);

  if (!deleteAssistant.deleted) {
    throw new Error("Failed to delete assistant");
  }
  
  await deleteRecord(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
