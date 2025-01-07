import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  ChoiceList,
} from '@shopify/polaris';
import { SaveBar } from '@shopify/app-bridge-react';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { api } from '../../api';
import color from 'color';
import { useTranslation } from 'react-i18next';

export default function GeneralSettings() {
  const { t } = useTranslation();
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
        },
      },
      options: true,
    },
  });

  const [{ data: updateData, error: updateError }, update] = useAction(api.chatbot.update);

  const [customName, setCustomName] = useState('');
  const [primaryColorText, setPrimaryColorText] = useState('#000000');
  const [secondaryColorText, setSecondaryColorText] = useState('#000000');
  const [primaryColorPicker, setPrimaryColorPicker] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0,
  });
  const [secondaryColorPicker, setSecondaryColorPicker] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0,
  });
  const [functions, setFunctions] = useState({});
  const [options, setOptions] = useState({
    alignment: 'right'
  });

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

      setOptions(data.options || { alignment: 'right' });

      initialDataRef.current = {
        customName: data.customName || '',
        primaryColorText: data.primaryColor || '#000000',
        secondaryColorText: data.secondaryColor || '#000000',
        primaryColorPicker: data.primaryColor
          ? colorToHSB(data.primaryColor)
          : { hue: 0, saturation: 0, brightness: 0 },
        secondaryColorPicker: data.secondaryColor
          ? colorToHSB(data.secondaryColor)
          : { hue: 0, saturation: 0, brightness: 0 },
        functions: data.functions || {},
        options: data.options || { alignment: 'right' },
      };
    }
  }, [data]);

  useEffect(() => {
    if (updateData) {
      shopify.toast.show(t('components.settings.GeneralSettings.updateSuccessToast'));
      initialDataRef.current = {
        customName,
        primaryColorText,
        secondaryColorText,
        primaryColorPicker,
        secondaryColorPicker,
        functions,
        options,
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
      customName,
      primaryColor: primaryColorText,
      secondaryColor: secondaryColorText,
      functions,
      options,
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
      setOptions(initialDataRef.current.options);
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
      JSON.stringify(functions) !== JSON.stringify(initialDataRef.current.functions) ||
      JSON.stringify(options) !== JSON.stringify(initialDataRef.current.options)
    );
  };

  useEffect(() => {
    if (isFormDirty()) {
      shopify.saveBar.show('general-settings-save-bar');
    } else {
      shopify.saveBar.hide('general-settings-save-bar');
    }
  }, [customName, primaryColorText, secondaryColorText, functions, options]);

  const colorToHSB = (colorString) => {
    try {
      const col = color(colorString);
      const hsv = col.hsv().object();

      return {
        hue: hsv.h,
        saturation: hsv.s / 100,
        brightness: hsv.v / 100,
      };
    } catch (e) {
      return { hue: 0, saturation: 0, brightness: 0 };
    }
  };

  const hsbToColorString = (hsb) => {
    try {
      const col = color.hsv(hsb.hue, hsb.saturation * 100, hsb.brightness * 100);
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

  // Handle alignment changes for the "options" object
  const handleAlignmentChange = useCallback((selected) => {
    setOptions({ ...options, alignment: selected[0] });
  }, [options]);

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
          {t('components.settings.GeneralSettings.saveBar.save')}
        </button>
        <button onClick={handleReset}>
          {t('components.settings.GeneralSettings.saveBar.discard')}
        </button>
      </SaveBar>
      <Form>
        <Layout>
          <Layout.Section>
            <BlockStack gap={400}>
              {/* Branding Card */}
              <Card>
                <FormLayout>
                  <Text variant="headingLg" as="h2">
                    {t('components.settings.GeneralSettings.form.branding')}
                  </Text>
                  <TextField
                    name="customName"
                    label={t('components.settings.GeneralSettings.form.name.label')}
                    value={customName}
                    onChange={(value) => setCustomName(value)}
                    requiredIndicator
                    placeholder={t('components.settings.GeneralSettings.form.name.placeholder')}
                  />

                  <FormLayout.Group>
                    <FormLayout>
                      <TextField
                        name="primaryColor"
                        label={t('components.settings.GeneralSettings.form.primaryColor.label')}
                        value={primaryColorText}
                        onChange={handlePrimaryColorTextChange}
                        helpText={t('components.settings.GeneralSettings.form.primaryColor.helpText')}
                      />
                      <ColorPicker
                        color={primaryColorPicker}
                        onChange={handlePrimaryColorPickerChange}
                      />
                    </FormLayout>
                    <FormLayout>
                      <TextField
                        name="secondaryColor"
                        label={t('components.settings.GeneralSettings.form.secondaryColor.label')}
                        value={secondaryColorText}
                        onChange={handleSecondaryColorTextChange}
                        helpText={t('components.settings.GeneralSettings.form.secondaryColor.helpText')}
                      />
                      <ColorPicker
                        color={secondaryColorPicker}
                        onChange={handleSecondaryColorPickerChange}
                      />
                    </FormLayout>
                  </FormLayout.Group>
                </FormLayout>
              </Card>

              {/* Functions Card */}
              <Card>
                <FormLayout>
                  <Text variant="headingLg" as="h2">
                    {t('components.settings.GeneralSettings.form.functions.heading')}
                  </Text>
                  <BlockStack>
                    <Checkbox
                      name="sendToCustomerSupport"
                      label={t('components.settings.GeneralSettings.form.functions.sendToCustomerSupport')}
                      checked={functions.sendToCustomerSupport || false}
                      onChange={(checked) =>
                        setFunctions({ ...functions, sendToCustomerSupport: checked })
                      }
                    />
                    <Checkbox
                      name="fetchProductRecommendation"
                      label={t('components.settings.GeneralSettings.form.functions.fetchProductRecommendation')}
                      checked={functions.fetchProductRecommendation || false}
                      onChange={(checked) =>
                        setFunctions({ ...functions, fetchProductRecommendation: checked })
                      }
                    />
                    <Checkbox
                      name="fetchProductByTitle"
                      label={t('components.settings.GeneralSettings.form.functions.fetchProductByTitle')}
                      checked={functions.fetchProductByTitle || false}
                      onChange={(checked) =>
                        setFunctions({ ...functions, fetchProductByTitle: checked })
                      }
                    />
                    <Checkbox
                      name="fetchParcelDataByEmail"
                      label={t('components.settings.GeneralSettings.form.functions.fetchParcelDataByEmail')}
                      checked={functions.fetchParcelDataByEmail || false}
                      onChange={(checked) =>
                        setFunctions({ ...functions, fetchParcelDataByEmail: checked })
                      }
                    />
                    <Checkbox
                      name="fetchParcelDataByOrderId"
                      label={t('components.settings.GeneralSettings.form.functions.fetchParcelDataByOrderId')}
                      checked={functions.fetchParcelDataByOrderId || false}
                      onChange={(checked) =>
                        setFunctions({ ...functions, fetchParcelDataByOrderId: checked })
                      }
                    />
                    <Checkbox
                      name="sendInvoice"
                      label={t('components.settings.GeneralSettings.form.functions.sendInvoice')}
                      checked={functions.sendInvoice || false}
                      onChange={(checked) => setFunctions({ ...functions, sendInvoice: checked })}
                      disabled={data?.shop.exactOnline.state !== 'has-token'}
                    />
                  </BlockStack>
                </FormLayout>
              </Card>

              {/* Alignment Card */}
              <Card>
                <FormLayout>
                  <Text variant="headingLg" as="h2">
                    {t('components.settings.GeneralSettings.form.options.heading')}
                  </Text>
                  <ChoiceList
                    title={t('components.settings.GeneralSettings.form.options.alignment.title')}
                    choices={[
                      {
                        label: t('components.settings.GeneralSettings.form.options.alignment.left'),
                        value: 'left',
                      },
                      {
                        label: t('components.settings.GeneralSettings.form.options.alignment.right'),
                        value: 'right',
                      },
                    ]}
                    selected={[options.alignment]}
                    onChange={handleAlignmentChange}
                  />
                </FormLayout>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Form>
    </>
  );
}