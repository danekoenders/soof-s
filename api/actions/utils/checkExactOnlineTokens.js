import { UtilsCheckExactOnlineTokensGlobalActionContext } from "gadget-server";
import { updateToken } from "../../utils/integrations/exactOnline";

/**
 * @param { UtilsCheckExactOnlineTokensGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  const needsRefreshDate = new Date(Date.now() +  3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
  
  const records = await api.integrations.exactOnline.findMany({
    filter: {
      refreshTokenExpiresAt: {
        before: needsRefreshDate,
      }
    }
  });

  if (records.length > 0) {
    for (const record of records) {
      try {
        await updateToken({ api, record });
        logger.info(`Token for record ${record.id} successfully updated since expiration was near.`);
      } catch (error) {
        logger.error(`Failed to update token for record ${record.id}: ${error.message}`);
      }
    }
  } else {
    logger.info("No tokens are close to expiration.");
  }
};

export const options = {
  triggers: {
    scheduler: [
      { every: "day", at: "00:00 UTC" },
    ],
  },
}
