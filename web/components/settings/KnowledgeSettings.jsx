import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Layout,
  Checkbox,
  SkeletonDisplayText,
  SkeletonBodyText,
  BlockStack,
  Text,
} from '@shopify/polaris';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { api } from '../../api';
import { PopularProductsList } from './KnowledgeSettings/PopularProductsList';

export default function KnowledgeSettings() {
  const initialDataRef = useRef(null);
  const [showErrors, setShowErrors] = useState(false);

  // State variables
  const [deliveryAmount, setDeliveryAmount] = useState('');
  const [freeDeliveryAmount, setFreeDeliveryAmount] = useState('');
  const [returnAndRefundPolicy, setReturnAndRefundPolicy] = useState('');
  const [deliveryCountries, setDeliveryCountries] = useState(['']);
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
      setDeliveryCountries(data.deliveryCountries || ['']);
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

      if (!initialDataRef.current) {
        initialDataRef.current = {
          deliveryAmount: data.deliveryAmount || '',
          freeDeliveryAmount: data.freeDeliveryAmount || '',
          returnAndRefundPolicy: data.returnAndRefundPolicy || '',
          deliveryCountries: data.deliveryCountries || [''],
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

    if (!areRequiredFieldsFilled()) {
      setShowErrors(true);
      shopify.toast.show('Missing required fields', {
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
      knowledge: knowledgeData,
    });

    initialDataRef.current = { ...knowledgeData };
    setShowErrors(false);
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
    const existingProductIds = popularProducts.map(product => product.id);

    const selectedProducts = await shopify.resourcePicker({
      type: 'product',
      multiple: 5,
      action: 'select',
      selectionIds: existingProductIds,
      filter: {
        variants: false,
      }
    });

    setPopularProducts(selectedProducts);
  };

  const handleDeliveryCountryChange = (value, index) => {
    const newDeliveryCountries = [...deliveryCountries];
    newDeliveryCountries[index] = value;
    setDeliveryCountries(newDeliveryCountries);
  };

  const handleAddDeliveryCountry = () => {
    setDeliveryCountries([...deliveryCountries, '']);
  };

  const handleRemoveDeliveryCountry = (index) => {
    const newDeliveryCountries = [...deliveryCountries];
    newDeliveryCountries.splice(index, 1);
    setDeliveryCountries(newDeliveryCountries);
  };

  const handlePaymentOptionClick = (option) => {
    if (paymentOptions.includes(option)) {
      setPaymentOptions(paymentOptions.filter((item) => item !== option));
    } else {
      setPaymentOptions([...paymentOptions, option]);
    }
  };

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
    return <Banner status="critical">Error: {error.message}</Banner>;
  }

  return (
    <form data-save-bar onSubmit={handleSubmit} onReset={handleReset}>
      <Layout>
        <Layout.AnnotatedSection
          title="Products"
          description="Manage your shop's product information."
        >
          <Card sectioned>
            <FormLayout>
              <BlockStack gap={300}>
                <BlockStack>
                  <Text variant='headingMd'>Products Category</Text>
                  <Text variant='bodyMd'>Your products category desscribes the type of products you sell.</Text>
                </BlockStack>
                <TextField
                  label="Products Category"
                  value={productCategory}
                  onChange={(value) => setProductCategory(value)}
                  error={
                    showErrors && productCategory === '' ? 'Product Category is required' : ''
                  }
                  helpText="e.g. Vitamins or Smartphone Accessories"
                />
              </BlockStack>
              <BlockStack gap={300}>
                <BlockStack>
                  <Text variant='headingMd'>Popular Products</Text>
                  <Text variant='bodyMd'>Select the products you want Soof to feature.</Text>
                </BlockStack>
                <PopularProductsList
                  popularProducts={popularProducts}
                  handleSelectPopularProducts={handleSelectPopularProducts}
                />
                {showErrors && popularProducts.length === 0 && (
                  <Banner status="critical">
                    At least one popular product is required.
                  </Banner>
                )}
              </BlockStack>
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        {/* Shipping Section */}
        <Layout.AnnotatedSection
          title="Shipping"
          description="Set your shipping rates and delivery times."
        >
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Delivery Amount"
                placeholder='$0.00'
                value={deliveryAmount}
                onChange={(value) => {
                  const strippedValue = value.replace('$', '');
                  const regex = /^\d*\.?\d*$/;
                  if (regex.test(strippedValue)) {
                    setDeliveryAmount('$' + strippedValue);
                  }
                }}
                error={
                  showErrors && deliveryAmount === '' ? 'Delivery Amount is required' : ''
                }
              />
              <TextField
                label="Free Delivery Amount"
                placeholder='$0.00'
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
                label="Minimum Delivery Days"
                placeholder='1'
                type="number"
                value={minDeliveryDays}
                onChange={(value) => setMinDeliveryDays(value)}
                error={
                  showErrors && minDeliveryDays === ''
                    ? 'Minimum Delivery Days is required'
                    : ''
                }
              />
              <TextField
                label="Maximum Delivery Days"
                placeholder='2'
                type="number"
                value={maxDeliveryDays}
                onChange={(value) => setMaxDeliveryDays(value)}
                error={
                  showErrors && maxDeliveryDays === ''
                    ? 'Maximum Delivery Days is required'
                    : ''
                }
              />
            </FormLayout>
            <BlockStack>
              {deliveryCountries.map((country, index) => (
                <BlockStack key={index} alignment="center">
                  <TextField
                    label={`Delivery Country ${index + 1}`}
                    value={country}
                    onChange={(value) => handleDeliveryCountryChange(value, index)}
                  />
                  <Button
                    icon="delete"
                    onClick={() => handleRemoveDeliveryCountry(index)}
                    disabled={deliveryCountries.length === 1}
                  />
                </BlockStack>
              ))}
              <Button onClick={handleAddDeliveryCountry}>Add Country</Button>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        {/* Payment Options Section */}
        <Layout.AnnotatedSection
          title="Payment Options"
          description="Select the payment methods you accept."
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
                <Banner status="critical">
                  At least one payment option is required.
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        {/* Policies Section */}
        <Layout.AnnotatedSection
          title="Policies"
          description="Provide your return address and refund policy."
        >
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Return Address"
                value={returnAddress}
                onChange={(value) => setReturnAddress(value)}
              />
              <TextField
                label="Return and Refund Policy"
                value={returnAndRefundPolicy}
                onChange={(value) => setReturnAndRefundPolicy(value)}
                multiline
                error={
                  showErrors && returnAndRefundPolicy === ''
                    ? 'Return and Refund Policy is required'
                    : ''
                }
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </form>
  );
}
