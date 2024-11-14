import { Page, Layout, Banner, Text, Button, BlockStack, Card } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import { useMantle } from '@heymantle/react';
import { PlanCardStack, PlanCardType } from '@heymantle/polaris';
import { ClockIcon } from "@shopify/polaris-icons";
import NoticeHeader from "../components/shared/NoticeHeader";
import { useTranslation } from 'react-i18next';

export default function () {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription, customer, plans, subscribe, cancelSubscription, refetch } = useMantle();

  return (
    <Page
      title={t('routes.plans.pageTitle')}
      backAction={{
        content: t('routes.plans.backAction.content'),
        onAction: () => navigate("/"),
      }}
    >
      <Layout>
        <NoticeHeader />
        <Layout.Section>
          <Card>
            <BlockStack gap={600}>
              <Text variant="bodyMd" as="p">
                {t('routes.plans.description')}
              </Text>
              {subscription && (new Date() < new Date(subscription.trialExpiresAt)) && (
                <Banner
                  title={t('routes.plans.banner.title')}
                  tone='info'
                  icon={ClockIcon}
                >
                  <Text variant="bodyMd" as="p">
                    {t('routes.plans.banner.body', {
                      days: Math.ceil(
                        (new Date(subscription.trialExpiresAt) - new Date()) /
                        (1000 * 60 * 60 * 24)
                      ),
                    })}
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
                const subscription = await subscribe({
                  planId: plan.id,
                  discountId: discount?.id,
                  returnUrl: '/',
                });
                if (subscription.error) {
                  console.error(
                    t('routes.plans.error.unableToSubscribe'),
                    subscription.error
                  );
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
              {t('routes.plans.cancelSubscriptionButton')}
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}