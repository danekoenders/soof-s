import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Form,
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
} from '@shopify/polaris';
import { SaveBar } from '@shopify/app-bridge-react';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { api } from '../../api';
import color from 'color';

export default function GeneralSettings() {
  const initialDataRef = useRef(null);
  const [showErrors, setShowErrors] = useState(false);

  const [{ data, error, fetching }, fetchChatbot] = useFindFirst(api.chatbot, {
    select: {
      id: true,
      customName: true,
      primaryColor: true,
      secondaryColor: true,
      functions: true,
      shop: {
        exactOnline: {
          state: true,
        }
      }
    },
  });

  const [{ data: updateData, error: updateError }, update] = useAction(api.chatbot.update);

  const [customName, setCustomName] = useState('');
  const [primaryColorText, setPrimaryColorText] = useState('#000000');
  const [secondaryColorText, setSecondaryColorText] = useState('#000000');
  const [primaryColorPicker, setPrimaryColorPicker] = useState({ hue: 0, saturation: 0, brightness: 0 });
  const [secondaryColorPicker, setSecondaryColorPicker] = useState({ hue: 0, saturation: 0, brightness: 0 });
  const [functions, setFunctions] = useState({});

  useEffect(() => {
    fetchChatbot();
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

      initialDataRef.current = {
        customName: data.customName || '',
        primaryColorText: data.primaryColor || '#000000',
        secondaryColorText: data.secondaryColor || '#000000',
        primaryColorPicker: data.primaryColor ? colorToHSB(data.primaryColor) : { hue: 0, saturation: 0, brightness: 0 },
        secondaryColorPicker: data.secondaryColor
          ? colorToHSB(data.secondaryColor)
          : { hue: 0, saturation: 0, brightness: 0 },
        functions: data.functions || {},
      };
    }
  }, [data]);

  useEffect(() => {
    if (updateData) {
      shopify.toast.show('Settings saved');
      initialDataRef.current = {
        customName,
        primaryColorText,
        secondaryColorText,
        primaryColorPicker,
        secondaryColorPicker,
        functions,
      };
      shopify.saveBar.hide('general-settings-save-bar');
    } else if (updateError) {
      shopify.toast.show(updateError.message, {
        isError: true,
      });
    }
  }, [updateData, updateError]);

  const handleSubmit = async () => {
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
      setPrimaryColorText(initialDataRef.current.primaryColorText);
      setSecondaryColorText(initialDataRef.current.secondaryColorText);
      setPrimaryColorPicker(initialDataRef.current.primaryColorPicker);
      setSecondaryColorPicker(initialDataRef.current.secondaryColorPicker);
      setFunctions(initialDataRef.current.functions);
    }
    setShowErrors(false);
    shopify.saveBar.hide('general-settings-save-bar');
  };

  const isFormDirty = () => {
    if (!initialDataRef.current) return false;

    return (
      customName !== initialDataRef.current.customName ||
      primaryColorText !== initialDataRef.current.primaryColorText ||
      secondaryColorText !== initialDataRef.current.secondaryColorText ||
      JSON.stringify(functions) !== JSON.stringify(initialDataRef.current.functions)
    );
  };

  useEffect(() => {
    if (isFormDirty()) {
      shopify.saveBar.show('general-settings-save-bar');
    } else {
      shopify.saveBar.hide('general-settings-save-bar');
    }
  }, [customName, primaryColorText, secondaryColorText, functions]);

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
    return <Banner tone="critical">Error: {error.message}</Banner>;
  }

  return (
    <>
      <SaveBar id="general-settings-save-bar">
        <button variant="primary" onClick={handleSubmit}>
          Save
        </button>
        <button onClick={handleReset}>Discard</button>
      </SaveBar>
      <Form>
        <Layout>
          <Layout.Section>
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
                      disabled={data?.shop.exactOnline.state !== 'has-token'}
                    />
                  </BlockStack>
                </FormLayout>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Form>
    </>
  );
}