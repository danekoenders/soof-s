import { RouteContext } from "gadget-server";
import { verifySignature } from "../../../../utils/shopify-proxy/signature";

/**
 * Route handler for POST api/chat/session/chatToken
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
    if (!verifySignature(request.query)) {
        throw new Error("Unauthorized");
    }

    if (!request.body.localLanguage) {
        throw new Error("Required fields missing");
    }

    const chatSession = await api.chatSession.create({
        email: request.body.email,
        myshopifyDomain: request.query.shop,
        localLanguage: request.body.localLanguage,
    });

    if (!chatSession) {
        return await reply.status(500).send({ error: "Internal Server Error" });
    }

    await reply.type("application/json").send({
        langGraphUrl: process.env.LANGGRAPH_DEPLOYMENT_URL,
        token: chatSession.token,
        thread: chatSession.thread,
        assistant: chatSession.lgAssistant,
        expiresAt: chatSession.expiresAt
    });
}