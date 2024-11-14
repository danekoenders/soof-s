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
import { useTranslation } from 'react-i18next';

export function PopularProductsList({ popularProducts, handleSelectPopularProducts }) {
    const { t } = useTranslation();
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
            <ResourceItem id={id} media={media} accessibilityLabel={`${t('components.settings.KnowledgeSettings.PopularProductsList.accessibilityLabel')} ${title}`}>
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
                        <Button onClick={handleSelectPopularProducts}>{t('components.settings.KnowledgeSettings.PopularProductsList.selectButton')}</Button>
                    </Layout.Section>
                </Layout>
            ) : (
                <Card>
                    <EmptyState
                        heading={t('components.settings.KnowledgeSettings.PopularProductsList.emptyState.heading')}
                        action={{
                            content: t('components.settings.KnowledgeSettings.PopularProductsList.emptyState.action'),
                            onAction: () => handleSelectPopularProducts(),
                        }}
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    />
                </Card>
            )}
        </>
    );
}