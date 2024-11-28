import { RouteContext } from "gadget-server";
import { verifySignature } from "../../../utils/shopify-proxy/signature";
import themes from "../../../utils/chatbotThemes.json";

function formatTheme({ theme, primary, secondary }) {
    const formattedTheme = {};

    for (const key in theme) {
        const value = theme[key];
        if (value === "primary") {
            formattedTheme[key] = primary;
        } else if (value === "secondary") {
            formattedTheme[key] = secondary;
        } else {
            formattedTheme[key] = value;
        }
    }

    return formattedTheme;
}

/**
 * Route handler for GET api/chatbot/serve
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
export default async function route({ request, reply, api, logger, connections }) {
    if (!verifySignature(request.query)) {
        throw new Error("Unauthorized");
    }

    const myshopifyDomain = request.query.shop;
    const chatbot = await api.chatbot.findFirst({
        select: {
            customName: true,
            primaryColor: true,
            secondaryColor: true,
            emailRequired: true,
            theme: true,
            shop: {
                name: true,
            }
        },
        filter: {
            shop: {
                myshopifyDomain: { equals: myshopifyDomain }
            }
        }
    });

    if (!chatbot) {
        return reply.status(400).send({ error: "No chatbot found" });
    }

    let theme = themes[chatbot.theme];
    if (!theme) {
        theme = themes.blank;
    }

    theme = formatTheme({ theme, primary: chatbot.primaryColor, secondary: chatbot.secondaryColor });

    const response = {
        chatbot: {
            id: chatbot.ref,
            customName: chatbot.customName,
            emailRequired: chatbot.emailRequired,
            theme: theme,
        },
        shop: {
            name: chatbot.shop.name,
        },
    };

    reply.headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    });

    await reply.type('application/json').send(response);
}
