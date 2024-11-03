const baseUrl = process.env.GADGET_PUBLIC_EXACT_ONLINE_BASE_URL;
const clientId = process.env.GADGET_PUBLIC_EXACT_ONLINE_CLIENT_ID;
const clientSecret = process.env.EXACT_ONLINE_CLIENT_SECRET;

async function fetchToken({ api, shopId, dateNow }) {
    const exactOnlineRecord = await api.integrations.exactOnline.findByShop(shopId);

    if (exactOnlineRecord) {
        if (dateNow > exactOnlineRecord.accessTokenExpiresAt) {
            const updatedRecord = await updateToken({ api, record: exactOnlineRecord });
            return updatedRecord.accessToken;
        } else {
            return exactOnlineRecord.accessToken;
        }
    } else {
        return null;
    }
}

async function updateToken({ api, record }) {
    if (record) {
        const dateNow = new Date(Date.now());

        try {
            const requestBody = new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "refresh_token",
                refresh_token: record.refreshToken,
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
                const accessTokenExpiresAt = new Date(dateNow.getTime() + data.expires_in * 1000);
                const refreshTokenExpiresAt = new Date(dateNow.getTime() + 30 * 24 * 60 * 60 * 1000);

                const updatedRecord = await api.integrations.exactOnline.update(record.id, {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    accessTokenExpiresAt: accessTokenExpiresAt,
                    refreshTokenExpiresAt: refreshTokenExpiresAt,
                });

                if (updatedRecord) {
                    return updatedRecord;
                } else {
                    throw new Error(`Failed to update record: ${record.id}`);
                }
            }
        } catch (error) {
            throw new Error(`Error fetching token: ${error}`);
        }
    } else {
        return null;
    }
}

export { fetchToken, updateToken };