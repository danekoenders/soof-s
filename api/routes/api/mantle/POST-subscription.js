import { RouteContext } from "gadget-server";
import { verifySignature } from "../../../../utils/mantle-proxy/signature";

/**
 * Route handler for POST api/mantle/subscription
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
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

  const shop = await api.shop.findByShopifyShopId(body.customer.shopify.shopId, {
    select: {
      id: true,
      plan: {
        id: true,
      }
    }
  });
  const planId = shop.plan.id;

  if (body.topic === "subscriptions/activate") {
    await api.plan.update(planId, {
      activePlan: body.plan.name,
      trialDays: body.plan.trialDays,
      chatLimit: body.plan.features.chats__mo.value,
      lastBilledAt: new Date(),
    })
  } else if (body.topic === "subscriptions/upgrade") {
    await api.plan.update(planId, {
      activePlan: body.plan.name,
      trialDays: body.plan.trialDays,
      chatLimit: body.plan.features.chats__mo.value,
    })
  } else if (body.topic === "subscriptions/downgrade") {
    await api.plan.update(planId, {
      activePlan: body.plan.name,
      trialDays: body.plan.trialDays,
      chatLimit: body.plan.features.chats__mo.value,
    })
  } else if (body.topic === "subscriptions/cancel") {
    await api.plan.update(planId, {
      activePlan: null,
      trialDays: body.plan.trialDays,
      chatLimit: 0,
    })
  }
}
