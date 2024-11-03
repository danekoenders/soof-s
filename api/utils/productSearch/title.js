import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX_PRODUCTS);

export async function productByTitle({ api, logger, connections, shopId, title }) {
    try {
        const queryVectorResponse = await connections.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: title,
        });

        if (!queryVectorResponse || !queryVectorResponse.data || queryVectorResponse.data.length === 0) {
            throw new Error("Failed to generate embeddings");
        }

        const queryVector = queryVectorResponse.data[0].embedding;

        const queryPineconeResponse = await index.namespace('title').query({
            topK: 1,
            vector: queryVector,
            includeMetadata: true,
            filter: { shopifyShopId: { '$eq': shopId } },
        });

        if (!queryPineconeResponse || !queryPineconeResponse.matches || queryPineconeResponse.matches.length === 0) {
            return {
                status: "No product found by this title"
            }
        }

        const topMatch = queryPineconeResponse.matches[0];
        const productId = topMatch.id;

        if (!productId) {
            throw new Error("Product ID not found in the Pinecone response");
        }

        const product = await api.shopifyProduct.findOne(productId, {
            select: {
                title: true,
                body: true,
                productCategory: true,
            }
        });

        if (!product) {
            return {
                status: "No product found by this title"
            }
        }

        const response = {
            status: "success",
            title: product.title,
            body: product.body,
            productCategory: product.productCategory?.productTaxonomyNode.fullName || null,
        };

        return response;
    } catch (error) {
        throw new Error(`An error occurred while fetching productByTitle: ${error.message}`);
    }
}
