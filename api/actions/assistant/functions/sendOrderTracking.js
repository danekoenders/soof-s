import { AssistantFunctionsSendOrderTrackingGlobalActionContext } from "gadget-server";
import { bridgeApi } from "../../../utils/bridgeApi";
import { generateAnonymousEmail } from "../../../utils/functions";

/**
 * @param { AssistantFunctionsSendOrderTrackingGlobalActionContext } context
 */
export async function run({ params, logger, api, connections, emails }) {
  const functionParams = params.functionParams
  const orderResponse = await getOrder({ orderId: functionParams.orderId });

  if (!orderResponse.success) {
    return orderResponse;
  }

  const emailAnonymous = generateAnonymousEmail(orderResponse.order.email);

  if (orderResponse.order.fulfillments.edges.length > 0) {
    const trackingButtons = orderResponse.order.fulfillments.edges.map((fulfillment) => {
      return `
        <div class="trackingButton">
          <a href="${fulfillment.node.trackingUrls[0]}" target="_blank">
            <button>Bekijk Tracking Pagina</button>
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
        <title>Factuur</title>
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
            button {
                background-color: #0056b3;
                color: #ffffff;
                border: none;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
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
            <%- trackingButtons %>
        </div>
    </body>
    </html>
    `;

    try {
      await emails.sendMail({
        to: orderResponse.order.email,
        subject: `Volg je bestelling`,
        html: DefaultEmailTemplates.renderEmailTemplate(CustomTemplate, {
          trackingButtons: trackingButtons,
        }),
      });
    } catch (error) {
      throw new Error("Error sending email:", error);
    }

    return {
      success: true,
      message: `Tracking informatie is verstuurd naar ${emailAnonymous}.`,
    };
  } else {
    return {
      success: false,
      message: "De bestelling is nog niet verzonden. Wanneer de bestelling verzonden is, ontvang je een e-mail met de tracking informatie.",
    };
  };
}

async function getOrder({ orderId }) {
  const order = await bridgeApi.shopifyOrder.findOne(orderId, {
    select: {
      fulfillmentStatus: true,
      email: true,
      fulfillments: {
        edges: {
          node: {
            id: true,
            shipmentStatus: true,
            status: true,
            trackingNumbers: true,
            trackingUrls: true,
          },
        },
      },
    },
  })

  if (order) {
    return ({
      success: true,
      order: order,
    })
  } else {
    return ({
      success: false,
      status: "No order found with that ID",
    });
  }
}
