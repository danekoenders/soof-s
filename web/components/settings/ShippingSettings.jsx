import React, { useEffect, useState, useRef } from 'react';
import {
    Card,
    Layout,
    Form,
    FormLayout,
    TextField,
    Banner,
    SkeletonBodyText,
    SkeletonDisplayText,
    BlockStack,
} from '@shopify/polaris';
import { SaveBar } from '@shopify/app-bridge-react';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';

export default function ShippingSettings() {
    const { t } = useTranslation();
    const initialDataRef = useRef(null);
    const [showErrors, setShowErrors] = useState(false);

    const [{ data, error, fetching }, fetchShop] = useFindFirst(api.shopifyShop, {
        select: {
            id: true,
            orderNamePrefix: true,
            orderNameSuffix: true,
        },
    });

    const [{ data: updateData, error: updateError }, update] = useAction(api.shopifyShop.update);

    const [orderNamePrefix, setOrderNamePrefix] = useState('');
    const [orderNameSuffix, setOrderNameSuffix] = useState('');

    useEffect(() => {
        fetchShop();
    }, [fetchShop]);

    useEffect(() => {
        if (data) {
            setOrderNamePrefix(data.orderNamePrefix || '');
            setOrderNameSuffix(data.orderNameSuffix || '');

            initialDataRef.current = {
                orderNamePrefix: data.orderNamePrefix || '',
                orderNameSuffix: data.orderNameSuffix || '',
            };
        }
    }, [data]);

    useEffect(() => {
        if (updateData) {
            shopify.toast.show(t('components.settings.toast.success'));
            initialDataRef.current = {
                orderNamePrefix,
                orderNameSuffix,
            };
            shopify.saveBar.hide('shipping-settings-save-bar');
        } else if (updateError) {
            shopify.toast.show(updateError.message, { isError: true });
        }
    }, [updateData, updateError, orderNamePrefix, orderNameSuffix]);

    const handleSubmit = async () => {
        await update({
            id: data.id,
            orderNamePrefix,
            orderNameSuffix,
        });
    };

    const handleReset = () => {
        if (initialDataRef.current) {
            setOrderNamePrefix(initialDataRef.current.orderNamePrefix);
            setOrderNameSuffix(initialDataRef.current.orderNameSuffix);
        }
        setShowErrors(false);
        shopify.saveBar.hide('shipping-settings-save-bar');
    };

    const isFormDirty = () => {
        if (!initialDataRef.current) return false;
        return (
            orderNamePrefix !== initialDataRef.current.orderNamePrefix ||
            orderNameSuffix !== initialDataRef.current.orderNameSuffix
        );
    };

    useEffect(() => {
        if (isFormDirty()) {
            shopify.saveBar.show('shipping-settings-save-bar');
        } else {
            shopify.saveBar.hide('shipping-settings-save-bar');
        }
    }, [orderNamePrefix, orderNameSuffix]);

    if (fetching) {
        return (
            <Layout>
                <Layout.Section>
                    <BlockStack gap="4">
                        <Card>
                            <BlockStack gap="4">
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText />
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        );
    }

    if (error) {
        return <Banner status="critical">Error: {error.message}</Banner>;
    }

    return (
        <>
            <SaveBar id="shipping-settings-save-bar">
                <button variant="primary" onClick={handleSubmit}>
                    {t('components.settings.saveBar.save')}
                </button>
                <button onClick={handleReset}>
                    {t('components.settings.saveBar.discard')}
                </button>
            </SaveBar>

            <Form>
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <FormLayout>
                                <TextField
                                    label={t('components.settings.ShippingSettings.orderPrefix.label')}
                                    value={orderNamePrefix}
                                    onChange={(value) => setOrderNamePrefix(value)}
                                    helpText={t('components.settings.ShippingSettings.orderPrefix.helpText')}
                                />
                                <TextField
                                    label={t('components.settings.ShippingSettings.orderSuffix.label')}
                                    value={orderNameSuffix}
                                    onChange={(value) => setOrderNameSuffix(value)}
                                    helpText={t('components.settings.ShippingSettings.orderSuffix.helpText')}
                                />
                            </FormLayout>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Form>
        </>
    );
}