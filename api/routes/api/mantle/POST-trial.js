import { RouteContext } from "gadget-server";

/**
 * Route handler for POST api/mantle/trial
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
export default async function route({ request, reply, api, logger, connections }) {
    const rawBody = JSON.stringify(request.body);
    const body = request.body;
    const headers = request.headers;

    const timestamp = headers['x-timestamp'];
    const expectedSignature = headers['x-mantle-hmac-sha256'];

    if (!verifySignature(timestamp, expectedSignature, rawBody)) {
        throw new Error("Unauthorized");
    }

    const shop = await api.shop.findByShopifyShopId(body.shopify.shopId, {
        select: {
            plan: {
                id: true,
            }
        }
    });
    const planId = shop.plan.id;

    if (body.topic === "customers/trial_expired") {
        await api.plan.update(planId, {
            trialDays: 0,
            chats: 0,
            lastBilledAt: new Date(),
        })
    }
}
