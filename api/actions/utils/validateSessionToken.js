export const params = {
  token: { type: "string" },
  myShopifyDomain: { type: "string" },
};

/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  try {
    const session = await api.chatSession.findByToken(params.token, {
      select: {
        rlIsLimited: true,
        thread: true,
        lgAssistant: true,
        expiresAt: true,
      },
      filter: {
        shop: {
          myshopifyDomain: { equals: params.myShopifyDomain },
        },
      },
    });

    // Validate session exists
    if (!session) {
      return { isValid: false, error: "No session found" };
    }

    // Validate thread exists
    if (!session.thread || !session.lgAssistant) {
      return {
        isValid: false,
        error: "No thread or assistant found for session",
      };
    }

    // Check if session is expired
    if (session.expiresAt) {
      const currentTime = new Date();
      const expirationTime = new Date(session.expiresAt);
      if (currentTime > expirationTime) {
        return { isValid: false, error: "Session expired" };
      }
    } else {
      return { isValid: false, error: "Session has no expiration date" };
    }

    // Check rate limiting
    if (session.rlIsLimited) {
      return {
        isValid: false,
        error: "Rate limit exceeded. Please wait before sending more messages.",
      };
    }

    return { isValid: true };
  } catch (error) {
    logger.error(error);
    return {
      isValid: false,
      error: "An error occurred while validating the session",
    };
  }
};
