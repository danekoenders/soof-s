import React, { useEffect, useState, useRef } from 'react';
import {
    Card,
    FormLayout,
    TextField,
    Banner,
    Checkbox,
    ColorPicker,
    BlockStack,
    Text,
    Layout,
    SkeletonBodyText,
    SkeletonDisplayText,
    Button,
} from '@shopify/polaris';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { api } from '../../api';
import color from 'color';

export default function GeneralSettings() {
    const [{ data, error, fetching }, fetchChatbot] = useFindFirst(api.chatbot, {
        select: {
            id: true,
            customName: true,
            primaryColor: true,
            secondaryColor: true,
            functions: true,
        },
    });

    const [{ data: updateData, error: updateError, fetching: updateFetching }, update] = useAction(api.chatbot.update);
    const [{ data: availableIntegrationsData }, fetchAvailableIntegrations] = useFindFirst(api.integrations.availableIntegrations);

    const [customName, setCustomName] = useState('');
    const [primaryColorText, setPrimaryColorText] = useState('#000000');
    const [secondaryColorText, setSecondaryColorText] = useState('#000000');
    const [primaryColorPicker, setPrimaryColorPicker] = useState({ hue: 0, saturation: 0, brightness: 0 });
    const [secondaryColorPicker, setSecondaryColorPicker] = useState({ hue: 0, saturation: 0, brightness: 0 });
    const [functions, setFunctions] = useState({});

    const initialDataRef = useRef(null);

    useEffect(() => {
        fetchChatbot();
        fetchAvailableIntegrations();
    }, []);

    useEffect(() => {
        if (data) {
            setCustomName(data.customName || '');

            if (data.primaryColor) {
                setPrimaryColorText(data.primaryColor);
                setPrimaryColorPicker(colorToHSB(data.primaryColor));
            }

            if (data.secondaryColor) {
                setSecondaryColorText(data.secondaryColor);
                setSecondaryColorPicker(colorToHSB(data.secondaryColor));
            }

            setFunctions(data.functions || {});

            if (!initialDataRef.current) {
                initialDataRef.current = {
                    customName: data.customName || '',
                    primaryColor: data.primaryColor || '',
                    secondaryColor: data.secondaryColor || '',
                    functions: data.functions || {},
                };
            }
        }
    }, [data]);

    useEffect(() => {
        if (updateData) {
            shopify.toast.show('Settings saved');
        } else if (updateError) {
            shopify.toast.show(updateError.message, {
                isError: true,
            });
        }
    }, [updateData, updateError]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await update({
            id: data.id,
            customName: customName,
            primaryColor: primaryColorText,
            secondaryColor: secondaryColorText,
            functions: functions,
        });
    };

    const handleReset = () => {
        if (initialDataRef.current) {
            setCustomName(initialDataRef.current.customName);
            setPrimaryColorText(initialDataRef.current.primaryColor);
            setSecondaryColorText(initialDataRef.current.secondaryColor);
            setFunctions(initialDataRef.current.functions);

            setPrimaryColorPicker(colorToHSB(initialDataRef.current.primaryColor));
            setSecondaryColorPicker(colorToHSB(initialDataRef.current.secondaryColor));
        }
    };

    const colorToHSB = (colorString) => {
        try {
            const col = color(colorString);
            const hsl = col.hsl().object();

            return {
                hue: hsl.h,
                saturation: hsl.s / 100,
                brightness: hsl.l / 100,
            };
        } catch (e) {
            return { hue: 0, saturation: 0, brightness: 0 };
        }
    };

    const hsbToColorString = (hsb) => {
        try {
            const col = color.hsl(hsb.hue, hsb.saturation * 100, hsb.brightness * 100);
            return col.hex();
        } catch (e) {
            return '#000000';
        }
    };

    const handlePrimaryColorTextChange = (value) => {
        setPrimaryColorText(value);
        const hsb = colorToHSB(value);
        setPrimaryColorPicker(hsb);
    };

    const handlePrimaryColorPickerChange = (value) => {
        setPrimaryColorPicker(value);
        const hex = hsbToColorString(value);
        setPrimaryColorText(hex);
    };

    const handleSecondaryColorTextChange = (value) => {
        setSecondaryColorText(value);
        const hsb = colorToHSB(value);
        setSecondaryColorPicker(hsb);
    };

    const handleSecondaryColorPickerChange = (value) => {
        setSecondaryColorPicker(value);
        const hex = hsbToColorString(value);
        setSecondaryColorText(hex);
    };

    if (fetching) {
        return (
            <Layout>
                <Layout.Section>
                    <BlockStack gap={400}>
                        <Card>
                            <BlockStack gap={400}>
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText />
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap={400}>
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
        <Layout>
            <Layout.Section>
                <form data-save-bar onSubmit={handleSubmit} onReset={handleReset}>
                    <BlockStack gap={400}>
                        <Card>
                            <FormLayout>
                                <Text variant="headingLg" as="h2">
                                    Branding
                                </Text>
                                <TextField
                                    name="customName"
                                    label="Name"
                                    value={customName}
                                    onChange={(value) => setCustomName(value)}
                                    requiredIndicator
                                    placeholder="Soof"
                                />

                                <FormLayout.Group>
                                    <FormLayout>
                                        <TextField
                                            name="primaryColor"
                                            label="Primary Color"
                                            value={primaryColorText}
                                            onChange={handlePrimaryColorTextChange}
                                            helpText="You can enter hex, rgb, or other color formats."
                                        />
                                        <ColorPicker
                                            color={primaryColorPicker}
                                            onChange={handlePrimaryColorPickerChange}
                                        />
                                    </FormLayout>
                                    <FormLayout>
                                        <TextField
                                            name="secondaryColor"
                                            label="Secondary Color"
                                            value={secondaryColorText}
                                            onChange={handleSecondaryColorTextChange}
                                            helpText="You can enter hex, rgb, or other color formats."
                                        />
                                        <ColorPicker
                                            color={secondaryColorPicker}
                                            onChange={handleSecondaryColorPickerChange}
                                        />
                                    </FormLayout>
                                </FormLayout.Group>
                            </FormLayout>
                        </Card>

                        <Card>
                            <FormLayout>
                                <Text variant="headingLg" as="h2">
                                    Functions
                                </Text>
                                <BlockStack>
                                    <Checkbox
                                        name="sendToCustomerSupport"
                                        label="Send chat to support email when no answer found"
                                        checked={functions.sendToCustomerSupport || false}
                                        onChange={(checked) =>
                                            setFunctions({ ...functions, sendToCustomerSupport: checked })
                                        }
                                    />
                                    <Checkbox
                                        name="fetchProductRecommendation"
                                        label="Fetch product recommendations"
                                        checked={functions.fetchProductRecommendation || false}
                                        onChange={(checked) =>
                                            setFunctions({ ...functions, fetchProductRecommendation: checked })
                                        }
                                    />
                                    <Checkbox
                                        name="fetchProductByTitle"
                                        label="Fetch product by title"
                                        checked={functions.fetchProductByTitle || false}
                                        onChange={(checked) =>
                                            setFunctions({ ...functions, fetchProductByTitle: checked })
                                        }
                                    />
                                    <Checkbox
                                        name="fetchParcelDataByEmail"
                                        label="Fetch parcel data using PostNL API (by Email)"
                                        checked={functions.fetchParcelDataByEmail || false}
                                        onChange={(checked) =>
                                            setFunctions({ ...functions, fetchParcelDataByEmail: checked })
                                        }
                                    />
                                    <Checkbox
                                        name="fetchParcelDataByOrderId"
                                        label="Fetch parcel data using PostNL API (by Order ID)"
                                        checked={functions.fetchParcelDataByOrderId || false}
                                        onChange={(checked) =>
                                            setFunctions({ ...functions, fetchParcelDataByOrderId: checked })
                                        }
                                    />
                                    <Checkbox
                                        name="sendInvoice"
                                        label="Send invoices using Exact Online (by Order ID)"
                                        checked={functions.sendInvoice || false}
                                        onChange={(checked) => setFunctions({ ...functions, sendInvoice: checked })}
                                        disabled={!availableIntegrationsData?.exactOnline}
                                    />
                                </BlockStack>
                            </FormLayout>
                        </Card>
                    </BlockStack>
                </form>
            </Layout.Section>
        </Layout>
    );
}
