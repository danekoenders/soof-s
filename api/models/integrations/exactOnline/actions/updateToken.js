import { applyParams, save, ActionOptions, UpdateTokenIntegrationsExactOnlineActionContext } from "gadget-server";

export const params = {
  code: { type: "string" },
};

/**
 * @param { UpdateTokenIntegrationsExactOnlineActionContext } context
 */
export async function run({ params, record, logger, api, connections, session }) {
  const sessionShopId = session.get("shop");

  if (sessionShopId !== record.shopId) {
    throw new Error("Unauthorized");
  }

  applyParams(params, record);
  
  if (record.state === "has-token") {
    throw new Error("Integration is already connected");
  }

  const baseUrl = process.env.GADGET_PUBLIC_EXACT_ONLINE_BASE_URL;
  const redirectUri = `${process.env.GADGET_PUBLIC_DOMAIN}/callbacks/exactOnline`;
  const clientId = process.env.GADGET_PUBLIC_EXACT_ONLINE_CLIENT_ID;
  const clientSecret = process.env.EXACT_ONLINE_CLIENT_SECRET;
  const decodedCode = decodeURIComponent(params.code);

  try {
    const requestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: decodedCode,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString();

    const url = `${baseUrl}/api/oauth2/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const responseBody = await response.text();
    const data = JSON.parse(responseBody);

    if (data) {
      record.accessToken = data.access_token;
      record.refreshToken = data.refresh_token;
      record.state = "has-token";
      record.accessTokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
      record.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    throw new Error(`Error fetching token: ${error}`);
  }

  await save(record);
};

/**
 * @param { UpdateTokenIntegrationsExactOnlineActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};