import { PlanCardStack, PlanCardType } from "@heymantle/polaris";
import { useMantle } from "@heymantle/react";
import { BlockStack, Button, Card, Layout, Text, InlineStack } from "@shopify/polaris";
import { ConnectIcon, PersonIcon, CursorIcon } from "@shopify/polaris-icons";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function SetupWizard({ data }) {
    const [currentStep, setCurrentStep] = useState(1);
    const { subscription, customer, plans, subscribe } = useMantle();
    const [searchParams] = useSearchParams();
    const stepParam = searchParams.get('step');

    useEffect(() => {
        if (stepParam) {
            setCurrentStep(parseInt(stepParam));
        }
    }, [stepParam]);

    const steps = [{
        id: 1,
        title: 'Select Plan',
    }, {
        id: 2,
        title: 'Connect Store',
    }];

    const handleStepClick = (step) => {
        // Fix subscription.active
        if (!subscription.active && currentStep === 1) {
            return
        }
        setCurrentStep(step);
    };

    return (
        <Layout>
            <Layout.Section>{
            /* Step Navigation */}
                <InlineStack align="center" gap="200" blockAlign="center">
                    {steps.map((step) => (
                        <Button
                            key={step.id}
                            variant={currentStep === step.id ? 'primary' : 'secondary'}
                            onClick={() => handleStepClick(step.id)}
                        >
                            <Text variant="headingSm">Step: {step.id}</Text>
                            {step.title}
                        </Button>
                    ))}
                </InlineStack>

                <Card sectioned padding={600}>


                    {/* Step Content */}
                    <BlockStack inlineAlign="center">
                        {currentStep === 1 && (
                            <BlockStack gap="200" inlineAlign="center">
                                <BlockStack gap="100" inlineAlign="center">
                                    <CursorIcon width={40} />
                                    <Text variant="headingMd" as="h2" alignment="center">
                                        Choose Your Plan
                                    </Text>
                                </BlockStack>
                                <BlockStack gap="100" inlineAlign="center">
                                    <Text as="p" alignment="center">
                                        All plans come with a 7-day free trial, feel free to test around!
                                    </Text>
                                    <Text as="p" alignment="center">
                                        <PlanCardStack
                                            cardType={PlanCardType.Highlighted}
                                            customer={customer}
                                            plans={plans}
                                            onSelectPlan={async ({ plan, discount }) => {
                                                const subscription = await subscribe({ planId: plan.id, discountId: discount?.id, returnUrl: '/?step=2' });
                                                if (subscription.error) {
                                                    console.error('Unable to subscribe: ', subscription.error);
                                                } else {
                                                    open(subscription.confirmationUrl, "_top");
                                                }
                                            }}
                                        />
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        )}

                        {currentStep === 2 && (
                            <BlockStack gap="400" inlineAlign="center">
                                <BlockStack gap="100" inlineAlign="center">
                                    <ConnectIcon width={40} />
                                    <Text variant="headingMd" as="h2" alignment="center">
                                        Connect Your Store
                                    </Text>
                                </BlockStack>
                                <BlockStack gap="100" inlineAlign="center">
                                    <Text as="p" alignment="center">
                                        Cool! Now that you have selected a plan, we can connect this store<br></br>to your Soof account.
                                        It's just a press of a button, that simple!
                                    </Text>
                                    <Button
                                        size="large"
                                        icon={ConnectIcon}
                                        variant="primary"
                                        url={`${process.env.GADGET_PUBLIC_SOOF_APP_DOMAIN}/new/shopify/${data?.shopConnection?.token}`}
                                        external
                                    >
                                        Connect Store using Account
                                    </Button>
                                </BlockStack>
                                <BlockStack gap="100" inlineAlign="center">
                                    <Text as="p" alignment="center">
                                        Don't have an account? Please sign up first and come back.
                                    </Text>
                                    <Button
                                        size="large"
                                        url={`${process.env.GADGET_PUBLIC_SOOF_APP_DOMAIN}/sign-up`}
                                        external
                                        icon={PersonIcon}
                                    >
                                        Create an Account
                                    </Button>
                                </BlockStack>
                            </BlockStack>
                        )}
                    </BlockStack>
                </Card>
            </Layout.Section>
        </Layout>
    );
}