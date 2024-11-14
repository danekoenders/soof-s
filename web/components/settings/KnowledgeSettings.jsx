import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Form,
  FormLayout,
  TextField,
  Banner,
  Layout,
  Checkbox,
  SkeletonDisplayText,
  SkeletonBodyText,
  BlockStack,
  Text,
} from '@shopify/polaris';
import { SaveBar } from '@shopify/app-bridge-react';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { api } from '../../api';
import { PopularProductsList } from './KnowledgeSettings/PopularProductsList';
import { DeliveryCountriesCombobox } from './KnowledgeSettings/DeliveryCountriesCombobox';
import { useTranslation } from 'react-i18next';

export default function KnowledgeSettings() {
  const { t } = useTranslation();
  const initialDataRef = useRef(null);
  const [showErrors, setShowErrors] = useState(false);

  // State variables
  const [deliveryAmount, setDeliveryAmount] = useState('');
  const [freeDeliveryAmount, setFreeDeliveryAmount] = useState('');
  const [returnAndRefundPolicy, setReturnAndRefundPolicy] = useState('');
  const [deliveryCountries, setDeliveryCountries] = useState([]);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState('');
  const [minDeliveryDays, setMinDeliveryDays] = useState('');
  const [returnAddress, setReturnAddress] = useState('');
  const [popularProducts, setPopularProducts] = useState([]);
  const [productCategory, setProductCategory] = useState('');
  const [paymentOptions, setPaymentOptions] = useState([]);

  const paymentOptionsList = [
    'Credit Card',
    'PayPal',
    'Bank Transfer',
    'Apple Pay',
    'Google Pay',
    'Klarna',
    'iDeal',
    'SOFORT',
    'Bancontact',
    'EPS',
    'Giropay',
    'Przelewy24',
    'Shop Pay',
    'Afterpay',
    'SEPA Direct Debit',
    'SEPA Credit Transfer',
    'Bitcoin',
    'Ethereum',
    'Litecoin',
  ];

  const [{ data, error, fetching }, fetchKnowledge] = useFindFirst(api.knowledge);
  const [{ data: updateData, error: updateError }, updateKnowledge] = useAction(api.knowledge.update);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  useEffect(() => {
    if (data) {
      setDeliveryAmount(data.deliveryAmount || '');
      setFreeDeliveryAmount(data.freeDeliveryAmount || '');
      setReturnAndRefundPolicy(data.returnAndRefundPolicy || '');
      setDeliveryCountries(data.deliveryCountries || []);
      setMaxDeliveryDays(data.maxDeliveryDays?.toString() || '');
      setMinDeliveryDays(data.minDeliveryDays?.toString() || '');
      setReturnAddress(data.returnAddress || '');
      setPopularProducts(data.popularProducts || []);
      setProductCategory(data.productCategory || '');
      setPaymentOptions(
        data.paymentOptions
          ? data.paymentOptions.split(', ').map((option) => option.trim())
          : []
      );

      initialDataRef.current = {
        deliveryAmount: data.deliveryAmount || '',
        freeDeliveryAmount: data.freeDeliveryAmount || '',
        returnAndRefundPolicy: data.returnAndRefundPolicy || '',
        deliveryCountries: data.deliveryCountries || [],
        maxDeliveryDays: data.maxDeliveryDays?.toString() || '',
        minDeliveryDays: data.minDeliveryDays?.toString() || '',
        returnAddress: data.returnAddress || '',
        popularProducts: data.popularProducts || [],
        productCategory: data.productCategory || '',
        paymentOptions: data.paymentOptions
          ? data.paymentOptions.split(', ').map((option) => option.trim())
          : [],
      };
    }
  }, [data]);

  useEffect(() => {
    if (updateData) {
      shopify.toast.show(t('components.settings.KnowledgeSettingsJSX.updateSuccessToast'));
    } else if (updateError) {
      shopify.toast.show(updateError.message, {
        isError: true,
      });
    }
  }, [updateData, updateError]);

  const handleSubmit = async () => {
    if (!areRequiredFieldsFilled()) {
      setShowErrors(true);
      shopify.toast.show(t('components.settings.KnowledgeSettingsJSX.requiredFieldsToast'), {
        isError: true,
      });
      return;
    }

    const knowledgeData = {
      deliveryAmount,
      freeDeliveryAmount: freeDeliveryAmount !== '' ? freeDeliveryAmount : null,
      returnAndRefundPolicy,
      deliveryCountries: deliveryCountries.filter((country) => country !== ''),
      maxDeliveryDays: parseInt(maxDeliveryDays),
      minDeliveryDays: parseInt(minDeliveryDays),
      returnAddress: returnAddress !== '' ? returnAddress : null,
      popularProducts,
      productCategory,
      paymentOptions: paymentOptions.join(', '),
    };

    await updateKnowledge({
      id: data.id,
      ...knowledgeData,
    });

    initialDataRef.current = { ...knowledgeData };

    setShowErrors(false);
    shopify.saveBar.hide('my-save-bar');
  };

  const handleReset = () => {
    if (initialDataRef.current) {
      setDeliveryAmount(initialDataRef.current.deliveryAmount);
      setFreeDeliveryAmount(initialDataRef.current.freeDeliveryAmount);
      setReturnAndRefundPolicy(initialDataRef.current.returnAndRefundPolicy);
      setDeliveryCountries(initialDataRef.current.deliveryCountries);
      setMaxDeliveryDays(initialDataRef.current.maxDeliveryDays);
      setMinDeliveryDays(initialDataRef.current.minDeliveryDays);
      setReturnAddress(initialDataRef.current.returnAddress);
      setPopularProducts(initialDataRef.current.popularProducts);
      setProductCategory(initialDataRef.current.productCategory);
      setPaymentOptions(initialDataRef.current.paymentOptions);
    }
    setShowErrors(false);
    shopify.saveBar.hide('my-save-bar');
  };

  const areRequiredFieldsFilled = () => {
    return (
      deliveryAmount !== '' &&
      returnAndRefundPolicy !== '' &&
      maxDeliveryDays !== '' &&
      minDeliveryDays !== '' &&
      productCategory !== '' &&
      popularProducts.length > 0 &&
      popularProducts.every((product) => product !== '') &&
      paymentOptions.length > 0
    );
  };

  const handleSelectPopularProducts = async () => {
    const existingProductIds = popularProducts.map((product) => product.id);

    const selectedProducts = await shopify.resourcePicker({
      type: 'product',
      multiple: 5,
      action: 'select',
      selectionIds: existingProductIds,
      filter: {
        variants: false,
      },
    });

    setPopularProducts(selectedProducts);
  };

  const handlePaymentOptionClick = (option) => {
    if (paymentOptions.includes(option)) {
      setPaymentOptions(paymentOptions.filter((item) => item !== option));
    } else {
      setPaymentOptions([...paymentOptions, option]);
    }
  };

  const isFormDirty = () => {
    if (!initialDataRef.current) return false;

    return (
      deliveryAmount !== initialDataRef.current.deliveryAmount ||
      freeDeliveryAmount !== initialDataRef.current.freeDeliveryAmount ||
      returnAndRefundPolicy !== initialDataRef.current.returnAndRefundPolicy ||
      JSON.stringify(deliveryCountries) !== JSON.stringify(initialDataRef.current.deliveryCountries) ||
      maxDeliveryDays !== initialDataRef.current.maxDeliveryDays ||
      minDeliveryDays !== initialDataRef.current.minDeliveryDays ||
      returnAddress !== initialDataRef.current.returnAddress ||
      JSON.stringify(popularProducts) !== JSON.stringify(initialDataRef.current.popularProducts) ||
      productCategory !== initialDataRef.current.productCategory ||
      JSON.stringify(paymentOptions) !== JSON.stringify(initialDataRef.current.paymentOptions)
    );
  };

  useEffect(() => {
    if (isFormDirty()) {
      shopify.saveBar.show('my-save-bar');
    } else {
      shopify.saveBar.hide('my-save-bar');
    }
  }, [
    deliveryAmount,
    freeDeliveryAmount,
    returnAndRefundPolicy,
    deliveryCountries,
    maxDeliveryDays,
    minDeliveryDays,
    returnAddress,
    popularProducts,
    productCategory,
    paymentOptions,
  ]);

  if (fetching) {
    return (
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap={400}>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    );
  }

  if (error) {
    return <Banner tone="critical">Error: {error.message}</Banner>;
  }

  return (
    <>
      <SaveBar id="my-save-bar">
        <button variant="primary" onClick={handleSubmit}>{t('components.settings.KnowledgeSettingsJSX.saveBar.save')}</button>
        <button onClick={handleReset}>{t('components.settings.KnowledgeSettingsJSX.saveBar.discard')}</button>
      </SaveBar>
      <Form>
        <Layout>
          <Layout.AnnotatedSection
            title={t('components.settings.KnowledgeSettingsJSX.form.products.title')}
            description={t('components.settings.KnowledgeSettingsJSX.form.products.description')}
          >
            <Card sectioned>
              <FormLayout>
                <BlockStack gap={300}>
                  <BlockStack>
                    <Text variant="headingMd">{t('components.settings.KnowledgeSettingsJSX.form.products.productsCategory.heading')}</Text>
                    <Text variant="bodyMd">{t('components.settings.KnowledgeSettingsJSX.form.products.productsCategory.body')}</Text>
                  </BlockStack>
                  <TextField
                    label={t('components.settings.KnowledgeSettingsJSX.form.products.productsCategory.label')}
                    value={productCategory}
                    onChange={(value) => setProductCategory(value)}
                    error={
                      showErrors && productCategory === '' ? t('components.settings.KnowledgeSettingsJSX.form.products.productsCategory.required') : ''
                    }
                    helpText={t('components.settings.KnowledgeSettingsJSX.form.products.productsCategory.helpText')}
                  />
                </BlockStack>
                <BlockStack gap={300}>
                  <BlockStack>
                    <Text variant="headingMd">{t('components.settings.KnowledgeSettingsJSX.form.products.popularProducts.heading')}</Text>
                    <Text variant="bodyMd">{t('components.settings.KnowledgeSettingsJSX.form.products.popularProducts.body')}</Text>
                  </BlockStack>
                  <PopularProductsList
                    popularProducts={popularProducts}
                    handleSelectPopularProducts={handleSelectPopularProducts}
                  />
                  {showErrors && popularProducts.length === 0 && (
                    <Banner tone="critical">
                      {t('components.settings.KnowledgeSettingsJSX.form.products.popularProducts.required')}
                    </Banner>
                  )}
                </BlockStack>
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>

          {/* Shipping Section */}
          <Layout.AnnotatedSection
            title={t('components.settings.KnowledgeSettingsJSX.form.shipping.title')}
            description={t('components.settings.KnowledgeSettingsJSX.form.shipping.description')}
          >
            <Card sectioned>
              <FormLayout>
                <TextField
                  label={t('components.settings.KnowledgeSettingsJSX.form.shipping.deliveryAmount.label')}
                  placeholder="$0.00"
                  value={deliveryAmount}
                  onChange={(value) => {
                    const strippedValue = value.replace('$', '');
                    const regex = /^\d*\.?\d*$/;
                    if (regex.test(strippedValue)) {
                      setDeliveryAmount('$' + strippedValue);
                    }
                  }}
                  error={
                    showErrors && deliveryAmount === '' ? t('components.settings.KnowledgeSettingsJSX.form.shipping.deliveryAmount.required') : ''
                  }
                />
                <TextField
                  label={t('components.settings.KnowledgeSettingsJSX.form.shipping.freeDeliveryAmount.label')}
                  placeholder="$0.00"
                  value={freeDeliveryAmount}
                  onChange={(value) => {
                    const strippedValue = value.replace('$', '');
                    const regex = /^\d*\.?\d*$/;
                    if (regex.test(strippedValue)) {
                      setFreeDeliveryAmount('$' + strippedValue);
                    }
                  }}
                />
                <TextField
                  label={t('components.settings.KnowledgeSettingsJSX.form.shipping.minDeliveryDays.label')}
                  placeholder="1"
                  type="number"
                  value={minDeliveryDays}
                  onChange={(value) => setMinDeliveryDays(value)}
                  error={
                    showErrors && minDeliveryDays === ''
                      ? t('components.settings.KnowledgeSettingsJSX.form.shipping.minDeliveryDays.required')
                      : ''
                  }
                />
                <TextField
                  label={t('components.settings.KnowledgeSettingsJSX.form.shipping.maxDeliveryDays.label')}
                  placeholder="2"
                  type="number"
                  value={maxDeliveryDays}
                  onChange={(value) => setMaxDeliveryDays(value)}
                  error={
                    showErrors && maxDeliveryDays === ''
                      ? t('components.settings.KnowledgeSettingsJSX.form.shipping.maxDeliveryDays.required')
                      : ''
                  }
                />
                <DeliveryCountriesCombobox
                  deliveryCountries={deliveryCountries}
                  setDeliveryCountries={setDeliveryCountries}
                />
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>

          {/* Payment Options Section */}
          <Layout.AnnotatedSection
            title={t('components.settings.KnowledgeSettingsJSX.form.paymentOptions.title')}
            description={t('components.settings.KnowledgeSettingsJSX.form.paymentOptions.description')}
          >
            <Card sectioned>
              <BlockStack spacing="tight">
                {paymentOptionsList.map((option) => (
                  <Checkbox
                    key={option}
                    label={option}
                    checked={paymentOptions.includes(option)}
                    onChange={() => handlePaymentOptionClick(option)}
                  />
                ))}
                {showErrors && paymentOptions.length === 0 && (
                  <Banner tone="critical">
                    {t('components.settings.KnowledgeSettingsJSX.form.paymentOptions.required')}
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>

          {/* Policies Section */}
          <Layout.AnnotatedSection
            title={t('components.settings.KnowledgeSettingsJSX.form.policies.title')}
            description={t('components.settings.KnowledgeSettingsJSX.form.policies.description')}
          >
            <Card sectioned>
              <FormLayout>
                <TextField
                  label={t('components.settings.KnowledgeSettingsJSX.form.policies.returnAddress.label')}
                  value={returnAddress}
                  onChange={(value) => setReturnAddress(value)}
                />
                <TextField
                  label={t('components.settings.KnowledgeSettingsJSX.form.policies.returnAndRefundPolicy.label')}
                  value={returnAndRefundPolicy}
                  onChange={(value) => setReturnAndRefundPolicy(value)}
                  multiline
                  error={
                    showErrors && returnAndRefundPolicy === ''
                      ? t('components.settings.KnowledgeSettingsJSX.form.policies.returnAndRefundPolicy.required')
                      : ''
                  }
                />
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Form>
    </>
  );
}