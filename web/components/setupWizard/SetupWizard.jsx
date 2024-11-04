import { PlanCardStack, PlanCardType } from "@heymantle/polaris";
import { useMantle } from "@heymantle/react";
import { BlockStack, Button, Card, Layout, Text } from "@shopify/polaris";
import { ConnectIcon, PersonIcon, CursorIcon, AppsIcon } from "@shopify/polaris-icons";
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

    useEffect(() => {
        if (currentStep === 1 && subscription?.active) {
            setCurrentStep(2);
        }
    }, [subscription]);

    const steps = [{
        id: 1,
        title: 'Select Plan',
    }, {
        id: 2,
        title: 'Connect Store',
    }];

    return (
        <Layout>
            <Layout.Section>
                <Card sectioned padding={600}>
                    {/* Step Content */}
                    {currentStep === 1 && (
                        <BlockStack gap="200">
                            <BlockStack gap="100" inlineAlign="center">
                                <Text variant="headingLg" as="h1" alignment="center">
                                    Welcome to Soof AI! 🚀
                                </Text>
                                <Text variant='bodyLg' as="p" alignment="center">
                                    We are excited to have you on board! Let's get started with setting up your account.
                                </Text>
                            </BlockStack>
                            <BlockStack gap="100" inlineAlign="center">
                                <CursorIcon width={40} />
                                <Text variant="headingMd" as="h2" alignment="center">
                                    Choose Your Plan
                                </Text>
                            </BlockStack>
                            <BlockStack gap="100">
                                <Text as="p" alignment="center">
                                    All plans come with a 7-day free trial, feel free to test around!
                                </Text>
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
                            </BlockStack>
                        </BlockStack>
                    )}

                    {currentStep === 2 && (
                        <BlockStack gap="400" inlineAlign="center">
                            <BlockStack gap="100" inlineAlign="center">
                                <AppsIcon width={40} />
                                <Text variant="headingMd" as="h2" alignment="center">
                                    Enable Extension
                                </Text>
                            </BlockStack>
                            <BlockStack gap="200" inlineAlign="center">
                                <Text as="p" alignment="center">
                                    Cool! Now that you have selected a plan, we can complete the setup by enabling the extension.
                                    <br></br>Our extension will add the embedded chat window to your store directly.
                                </Text>
                                <Button
                                    size="large"
                                    icon={CursorIcon}
                                    variant="primary"
                                    url={`https://${data.myshopifyDomain}/admin/themes/current/editor?context=apps&activateAppId=12ce97d9-0cfd-4370-b945-ee218d44b892/soof-chat`}
                                    target="_blank"
                                >
                                    Enable Extension
                                </Button>
                            </BlockStack>
                        </BlockStack>
                    )}
                </Card>
            </Layout.Section>
        </Layout>
    );
}