import { Page, Layout, Banner, Text, Button, BlockStack, Card } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import { useMantle } from '@heymantle/react';
import { PlanCardStack, PlanCardType } from '@heymantle/polaris';
import { ClockIcon } from "@shopify/polaris-icons";
import NoticeHeader from "../components/shared/NoticeHeader";

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
      <Layout>
        <NoticeHeader />
        <Layout.Section>
          <Card>
            <BlockStack gap={600}>
              <Text variant="bodyMd" as="p">
                Each plan comes with a Free 7-day Trial. You can change or cancel your plan at any time.
              </Text>
              {subscription && (new Date() < new Date(subscription.trialExpiresAt)) && (
                <Banner
                  title="You are on a free trial"
                  tone='info'
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
          </Card>
        </Layout.Section>
        <Layout.Section>
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