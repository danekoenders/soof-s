import { preventCrossShopDataAccess, deleteRecord, ActionOptions, DeleteShopifyProductActionContext } from "gadget-server";
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const index = pc.index(process.env.PINECONE_INDEX_PRODUCTS);

/**
 * @param { DeleteShopifyProductActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await preventCrossShopDataAccess(params, record);
  await deleteRecord(record);
};

/**
 * @param { DeleteShopifyProductActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  await index.namespace('title').deleteOne(record.id);
  await index.namespace('body').deleteOne(record.id);
};

/** @type { ActionOptions } */
export const options = { actionType: "delete" };
