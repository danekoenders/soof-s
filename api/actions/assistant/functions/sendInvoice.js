import { AssistantFunctionsSendInvoiceGlobalActionContext, DefaultEmailTemplates } from "gadget-server";
import { fetchToken } from "../../../utils/integrations/exactOnline";
import { generateAnonymousEmail } from "../../../utils/functions";
import { translate } from "../../../utils/i18next";

export const params = {
  orderId: { type: "string" },
  shopId: { type: "string" },
  localLanguage: { type: "string", required: true },
};

/**
 * @param { AssistantFunctionsSendInvoiceGlobalActionContext } context
 */
export async function run({ params, logger, api, connections, emails }) {
  let { orderId } = params;
  const { shopId } = params;

  if (!orderId.startsWith("#")) {
    orderId = `#${orderId}`;
  }

  const order = await api.shopifyOrder.maybeFindFirst({
    select: {
      email: true,
      name: true,
      shop: {
        name: true,
      }
    },
    filter: {
      AND: [
        { shop: { equals: shopId } },
        { name: { equals: orderId } },
      ]
    }
  })
  
  if (!order) {
    return ({
      success: false,
      message: "Incorrect order ID, please try again.",
    })
  }

  const emailAnonymous = generateAnonymousEmail(order.email);

  const dateNow = new Date(Date.now());
  const exactOnlineToken = await fetchToken({ api, shopId, dateNow });

  if (!exactOnlineToken) {
    throw new Error("No Exact Online integration found for this shop");
  }

  const baseUrl = process.env.GADGET_PUBLIC_EXACT_ONLINE_BASE_URL;
  let division = "";
  let invoiceNumber = "";
  let attachmentsUri = "";
  let attachmentUrl = "";

  // Fetch division
  const url = `${baseUrl}/api/v1/current/Me?$select=CurrentDivision`;
  const divisionResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${exactOnlineToken}`,
    }
  });

  const divisionData = await divisionResponse.json();
  division = divisionData.d.results ? divisionData.d.results[0].CurrentDivision : null;

  if (!division) throw new Error("No division found");

  // Fetch invoice Number
  const invoiceUrl = `${baseUrl}/api/v1/${division}/salesinvoice/SalesInvoices?$filter=substringof('${params.orderId}', Description) eq true&$select=InvoiceNumber`;
  const invoiceResponse = await fetch(invoiceUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${exactOnlineToken}`,
    }
  });

  const invoiceData = await invoiceResponse.json();
  if (!invoiceData.d.results || invoiceData.d.results.length === 0) {
    return {
      success: false,
      message: "No invoice id found, please try again",
    };
  } else if (invoiceData.d.results.length > 1) {
    return {
      success: false,
      message: "Multiple invoice ids found, please specify 1 order id",
    };
  } else {
    invoiceNumber = invoiceData.d.results[0].InvoiceNumber;
  }

  // Get attachments uri
  const docUrl = `${baseUrl}/api/v1/${division}/read/crm/Documents?$filter=SalesInvoiceNumber eq ${invoiceNumber}&$select=Attachments`;
  const docResponse = await fetch(docUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${exactOnlineToken}`,
    }
  });

  const docData = await docResponse.json();

  if (!docData.d.results) {
    throw new Error("No invoice id found");
  } else {
    attachmentsUri = docData.d.results[0].Attachments.__deferred.uri;
  }

  // Get attachments
  const attachmentsResponse = await fetch(attachmentsUri, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${exactOnlineToken}`,
    }
  });

  const attachmentsData = await attachmentsResponse.json();
  if (!attachmentsData.d.results || attachmentsData.d.results.length === 0) {
    throw new Error("No attachments found");
  } else {
    attachmentUrl = attachmentsData.d.results[0].AttachmentUrl;
  }

  // // Get attachment data
  async function getPdfBuffer() {
    try {
      const attachmentResponse = await fetch(attachmentUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${exactOnlineToken}`,
        }
      });

      if (!attachmentResponse.ok) throw new Error(`HTTP error! status: ${attachmentResponse.status}`);
      const arrayBuffer = await attachmentResponse.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error("Error fetching PDF:", error);
    }
  }

  const pdfBuffer = await getPdfBuffer();
  const emailTitle = await translate({isoCode: params.localLanguage, key: 'actions.assistant.functions.sendInvoice.title'})

  const CustomTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailTitle} <%- shopName %></title>
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
        </style>
    </head>
    <body>
        <div class="email-container">
            <h1>${emailTitle} <%- shopName %></h1>
            <p>${await translate({isoCode: params.localLanguage, key: 'actions.assistant.functions.sendInvoice.description.first'})} <%- orderName %> ${await translate({isoCode: params.localLanguage, key: 'actions.assistant.functions.sendInvoice.description.second'})}</p>
        </div>
    </body>
    </html>
    `;

  try {
    await emails.sendMail({
      to: order.email,
      subject: `${emailTitle} ${order.shop.name}`,
      html: DefaultEmailTemplates.renderEmailTemplate(CustomTemplate, {
        shopName: order.shop.name,
        orderName: order.name,
      }),
      attachments: [
        {
          filename: `${params.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  } catch (error) {
    throw new Error("Error sending email:", error);
  }

  return {
    success: true,
    message: "Invoice sent",
    instructions: "Inform the customer with the full email address.",
    email: emailAnonymous
  };
}
