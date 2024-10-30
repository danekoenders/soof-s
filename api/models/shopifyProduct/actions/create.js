import { applyParams, preventCrossShopDataAccess, save, ActionOptions, CreateShopifyProductActionContext } from "gadget-server";
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const index = pc.index(process.env.PINECONE_INDEX_PRODUCTS);

/**
 * @param { CreateShopifyProductActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { CreateShopifyProductActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  const strippedTitle = record.title.replace(/<\/?[^>]+(>|$)/g, "");
  const strippedBody = record.body.replace(/<\/?[^>]+(>|$)/g, "");

  const titleVector = await connections.openai.embeddings.create({
    model: "text-embedding-3-small",
    input: strippedTitle,
  })

  const bodyVector = await connections.openai.embeddings.create({
    model: "text-embedding-3-small",
    input: strippedBody,
  })

  if (!titleVector || !bodyVector) {
    throw new Error("Failed to generate embeddings");
  }

  await index.namespace('title').upsert([
    {
      id: record.id,
      values: titleVector.data[0].embedding,
      metadata: { shopifyShopId: record.shopId }
    }
  ]);

  await index.namespace('body').upsert([
    {
      id: record.id,
      values: bodyVector.data[0].embedding,
      metadata: { shopifyShopId: record.shopId }
    }
  ]);
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
