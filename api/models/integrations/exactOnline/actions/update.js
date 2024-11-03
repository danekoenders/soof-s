import { applyParams, save, ActionOptions, UpdateIntegrationsExactOnlineActionContext } from "gadget-server";

/**
 * @param { UpdateIntegrationsExactOnlineActionContext } context
 */
export async function run({ params, record, logger, api, connections, session }) {
  if (session) {
    const sessionShopId = session.get("shop");

    if (sessionShopId !== record.shopId) {
      throw new Error("Unauthorized");
    }

    if (params.exactOnline.state === "disconnected") {
      record.state = 'disconnected';
    }

  } else {
    applyParams(params, record);
  }

  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
