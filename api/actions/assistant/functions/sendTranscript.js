import { SendTranscriptGlobalActionContext, DefaultEmailTemplates } from "gadget-server";
import { formatTranscript } from "../../../utils/functions";

/**
 * @param { SendTranscriptGlobalActionContext } context
 */

export const params = {
  sessionId: { type: "string" },
  lastMessage: { type: "string" }
};

export async function run({ params, logger, api, connections, emails }) {
  const chatSession = await api.chatSession.findOne(params.sessionId, {
    select: {
      id: true,
      transcript: true,
      shop: {
        id: true,
        createdAt: true,
        supportEmail: true,
        customName: true,
      },
    },
  });

  const email = chatSession.shop.supportEmail;
  const shopName = chatSession.shop.customName;
  const rawTranscript = chatSession.transcript;
  let formattedTranscript = '';

  if (rawTranscript) {
    formattedTranscript = formatTranscript(rawTranscript);
  } else {
    formattedTranscript = '';
  }

  // create your custom email template
  const CustomTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unanswered Question on <%= shopName %></title>
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
          }
          .header {
              background-color: #0056b3;
              color: #ffffff;
              padding: 10px 20px;
              text-align: center;
          }
          .header h1 {
              margin: 0;
              font-size: 24px;
          }
          .content {
              padding: 20px;
              line-height: 1.6;
              display: flex;
              flex-direction: column;
          }
          .message {
              margin-bottom: 10px;
              padding: 10px;
              border-radius: 5px;
          }
          .message.user {
              background-color: #e8f7ff;
          }
          .message.assistant {
              background-color: #F0F0F0;
          }
          .timestamp {
              font-size: 12px;
              color: #777;
          }
          .message-content {
              font-size: 14px;
          }
          .footer {
              text-align: center;
              padding: 10px 20px;
              background-color: #e8e8e8;
              font-size: 12px;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">
              <h1><%= shopName %></h1>
          </div>
          <div class="content">
              <%- transcript %>
              <div class="message user">
                  <div class="timestamp"><strong>Latest</strong></div>
                  <div class="message-content"><%= lastMessage %></div>
              </div>
          </div>
          <div class="footer">
              Powered by Soof.
          </div>
      </div>
  </body>
  </html>
`;

  await emails.sendMail({
    to: email,
    subject: `Unanswered question on ${shopName}`,
    // Pass your custom template
    // The default template is an EJS string
    html: DefaultEmailTemplates.renderEmailTemplate(CustomTemplate, {
      shopName: shopName,
      lastMessage: params.lastMessage,
      transcript: formattedTranscript,
    }),
  });

  return {
    status: "Chat has been sent",
    instructions: "Inform customer that the chat has been sent to the customer support team.",
  };
};

export const options = { triggers: { api: true } }
