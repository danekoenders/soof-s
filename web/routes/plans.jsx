import { Page, Layout, Banner, Text, Button, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import { useMantle } from '@heymantle/react';
import { PlanCardStack, PlanCardType } from '@heymantle/polaris';
import { ClockIcon } from "@shopify/polaris-icons";

export default function () {
  const navigate = useNavigate();
  const { subscription, customer, plans, subscribe, cancelSubscription, refetch } = useMantle();

  return (
    <Page
      title="Plans"
      backAction={{
        content: "Shop Information",
        onAction: () => navigate("/"),
      }}
    >
      <TitleBar title="Select a plan" />
      <Layout>
        <Layout.Section>
          <BlockStack gap={600}>
            <Text variant="bodyMd" as="p">
              Plans on Soof are billed per shop. Which means that all shops you own in your Soof account, are able to have a different subscription plan. You can change or cancel your plan at any time.
            </Text>
            {subscription && (new Date() < new Date(subscription.trialExpiresAt)) && (
              <Banner
                title="You are on a free trial"
                tone="warning"
                icon={ClockIcon}
              >
                <Text variant="bodyMd" as="p">
                  Your free trial will expire in {Math.ceil((new Date(subscription.trialExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))} day(s).
                </Text>
              </Banner>
            )}
          </BlockStack>
          <PlanCardStack
            cardType={PlanCardType.Highlighted}
            customer={customer}
            plans={plans}
            showRecommendedPlanBadge={true}
            onSelectPlan={async ({ plan, discount }) => {
              const subscription = await subscribe({ planId: plan.id, discountId: discount?.id, returnUrl: '/' });
              if (subscription.error) {
                console.error('Unable to subscribe: ', subscription.error);
              } else {
                open(subscription.confirmationUrl, "_top");
              }
            }}
          />
          {subscription && subscription.active && (
            <Button
              onClick={async () => {
                await cancelSubscription();
                await refetch();
              }}
            >
              Cancel Subscription
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}