import { AssistantFrontendFunctionsSendOrderTrackingGlobalActionContext, DefaultEmailTemplates } from "gadget-server";
import { generateAnonymousEmail } from "../../../utils/functions";

export const params = {
  functionParams: {
    type: "object",
    properties: {
      orderId: { type: "string" },
    },
  },
};

/**
 * @param { AssistantFrontendFunctionsSendOrderTrackingGlobalActionContext } context
 */
export async function run({ params, logger, api, connections, emails }) {
  const functionParams = params.functionParams;
  const order = await api.shopifyOrder.findOne(functionParams.orderId, {
    select: {
      email: true,
      fulfillmentStatus: true,
      fulfillments: {
        edges: {
          node: {
            trackingUrls: true,
          },
        },
      },
    },
  });

  if (!order) {
    return {
      success: false,
      message: "Incorrect order ID, please try again.",
    };
  }

  const emailAnonymous = generateAnonymousEmail(order.email);

  if (order.fulfillmentStatus === 'fulfilled') {
    const trackingButtons = order.fulfillments.edges.map((fulfillment) => {
      const trackingUrl = fulfillment.node.trackingUrls[0];
      if (!trackingUrl) {
        logger.warn(`Fulfillment ${fulfillment.node.id} has no tracking URL.`);
        return ''; // Skip if no tracking URL
      }

      return `
        <div class="trackingButton">
          <a href="${trackingUrl}" target="_blank" style="text-decoration: none;">
            <button style="background-color: #0056b3; color: #ffffff; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer;">
              Bekijk Tracking Pagina
            </button>
          </a>
        </div>
      `;
    }).join('');

    const CustomTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Volg je bestelling</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .email-container {
                max-width: 600px;
                background-color: #ffffff;
                margin: 40px auto;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                text-align: center;
            }
            h1 {
                font-size: 24px;
                color: #0056b3;
                margin: 20px 0;
            }
            p {
                font-size: 16px;
                line-height: 1.6;
                color: #666;
                padding: 0 20px;
            }
            .trackingButton {
                margin: 20px 0;
            }
            button:hover {
                background-color: #003366;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <h1>Volg je bestelling</h1>
            <p>Je bestelling is onderweg! Bekijk de tracking informatie hieronder:</p>
            ${trackingButtons}
        </div>
    </body>
    </html>
    `;

    try {
      await emails.sendMail({
        to: order.email,
        subject: `Volg je bestelling`,
        html: DefaultEmailTemplates.renderEmailTemplate(CustomTemplate)
      });
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }

    return {
      success: true,
      message: `Ik heb de tracking informatie verstuurd naar:
      ${emailAnonymous}. Veel plezier alvast met je bestelling!`,
    };
  } else {
    return {
      success: false,
      message: "Your order has not been shipped yet. When it is, you will receive an email with tracking information.",
    };
  }
}