import { AssistantFrontendFunctionsSendOrderTrackingGlobalActionContext, DefaultEmailTemplates } from "gadget-server";
import { generateAnonymousEmail } from "../../../utils/functions";
import { translate } from "../../../utils/i18next";

export const params = {
  localLanguage: {
    type: "string",
  },
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
    const trackingButtonsArray = await Promise.all(order.fulfillments.edges.map(async (fulfillment) => {
      const trackingUrl = fulfillment.node.trackingUrls[0];
      if (!trackingUrl) {
        logger.warn(`Fulfillment ${fulfillment.node.id} has no tracking URL.`);
        return '';
      }

      const translatedText = await translate({
        isoCode: params.localLanguage,
        key: 'actions.assistant.frontendFunctions.sendOrderTracking.trackingButton',
      });

      return `
        <div class="trackingButton">
          <a href="${trackingUrl}" target="_blank" style="text-decoration: none;">
            <button style="background-color: #0056b3; color: #ffffff; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer;">
              ${translatedText}
            </button>
          </a>
        </div>
      `;
    }));

    const trackingButtons = trackingButtonsArray.join('');
    const emailTitle = await translate({isoCode: params.localLanguage, key: 'actions.assistant.frontendFunctions.sendOrderTracking.title'})

    const CustomTemplate = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${emailTitle}
            </title>
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
              <h1>${emailTitle}</h1>
              <p>${await translate({isoCode: params.localLanguage, key: 'actions.assistant.frontendFunctions.sendOrderTracking.description'})}</p>
              ${trackingButtons}
          </div>
      </body>
      </html>
    `;

    try {
      await emails.sendMail({
        to: order.email,
        subject: emailTitle,
        html: DefaultEmailTemplates.renderEmailTemplate(CustomTemplate),
      });
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }

    return {
      success: true,
      message: `${await translate({isoCode: params.localLanguage, key: 'actions.assistant.frontendFunctions.sendOrderTracking.returnMessage.success.first'})} ${emailAnonymous}${await translate({isoCode: params.localLanguage, key: 'actions.assistant.frontendFunctions.sendOrderTracking.returnMessage.success.second'})}`,
    };
  } else {
    return {
      success: false,
      message: `${await translate({isoCode: params.localLanguage, key: 'actions.assistant.frontendFunctions.sendOrderTracking.returnMessage.failed'})}`,
    };
  }
}