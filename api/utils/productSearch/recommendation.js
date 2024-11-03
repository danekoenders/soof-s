import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const index = pc.index(process.env.PINECONE_INDEX_PRODUCTS);

export async function productRecommendation({ api, logger, connections, shopId, searchQuery }) {
    const queryVector = await connections.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: searchQuery,
    });

    if (!queryVector) {
        throw new Error("Failed to generate embeddings");
    }


    const queryPineconeBody = await index.namespace('body').query({
        topK: 5,
        vector: queryVector.data[0].embedding,
        includeValues: true,
        includeMetadata: true,
        filter: { shopifyShopId: { '$eq': shopId } },
    });

    // Query the 'title' namespace
    const queryPineconeTitle = await index.namespace('title').query({
        topK: 5,
        vector: queryVector.data[0].embedding,
        includeValues: true,
        includeMetadata: true,
        filter: { shopifyShopId: { '$eq': shopId } },
    });

    // Combine matches from both queries
    const allMatches = [...queryPineconeBody.matches, ...queryPineconeTitle.matches];

    // Remove duplicate products, keeping the one with the highest score
    const matchesMap = {};

    allMatches.forEach(match => {
        if (!matchesMap[match.id] || matchesMap[match.id].score < match.score) {
            matchesMap[match.id] = match;
        }
    });

    const combinedMatches = Object.values(matchesMap);

    // Sort the combined matches by score in descending order
    combinedMatches.sort((a, b) => b.score - a.score);

    // Take the top 5 matches
    const topMatches = combinedMatches.slice(0, 5);

    // Fetch detailed product data for all top matches concurrently
    const productPromises = topMatches.map(async match => {
        return await api.shopifyProduct.findOne(match.id, {
            select: {
                title: true,
                handle: true,
                variants: {
                    edges: {
                        node: {
                            position: true,
                            price: true,
                        },
                    },
                },
                images: {
                    edges: {
                        node: {
                            position: true,
                            source: true,
                        },
                    },
                },
            },
        });
    });

    // Wait for all product data to be fetched
    const productData = await Promise.all(productPromises);

    // Check if any products were found
    if (productData.length < 1) {
        const response = {
            status: "failed",
            message: "No products found on this search query",
        };

        return response;
    }

    // Construct the response object with the desired structure
    return {
        status: "success",
        amount: productData.length,
        products: productData.map((product) => {
            return {
                title: product.title,
                handle: product.handle,
                images: product.images?.edges.filter(image => image.node.position === 1),
                variants: product.variants?.edges.filter(variant => {
                    const minPosition = Math.min(...product.variants.edges.map(variant => variant.node.position));
                    return variant.node.position === minPosition;
                }),
            };
        }),
    };
}