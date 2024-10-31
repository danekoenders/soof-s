import React from 'react';
import {
    Card,
    ResourceList,
    ResourceItem,
    Banner,
    Text,
    Thumbnail,
    EmptyState,
    Button,
    Layout,
} from '@shopify/polaris';

export function PopularProductsList({ popularProducts, handleSelectPopularProducts }) {
    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const renderItem = (item) => {
        const { id, title } = item;
        const featuredImage = item.images[0]?.originalSrc;

        const media = (
            <Thumbnail
                source={featuredImage || ''}
                size="extraSmall"
                alt={title}
            />
        );

        return (
            <ResourceItem id={id} media={media} accessibilityLabel={`Popular product: ${title}`}>
                <Text variant="headingMd">{title}</Text>
            </ResourceItem>
        );
    };

    return (
        <>
            {popularProducts?.length > 0 ? (
                <Layout>
                    <Layout.Section>
                        <ResourceList
                            resourceName={resourceName}
                            items={popularProducts}
                            renderItem={renderItem}
                        />
                        <Button onClick={handleSelectPopularProducts}>Select Popular Products</Button>
                    </Layout.Section>
                </Layout>
            ) : (
                <Card>
                    <EmptyState
                        heading="Select popular products"
                        action={{
                            content: 'Select products',
                            onAction: () => handleSelectPopularProducts(),
                        }}
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                        <p>Track and receive your incoming inventory from suppliers.</p>
                    </EmptyState>
                </Card>
            )}
        </>
    );
}