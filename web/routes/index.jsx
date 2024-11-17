import { useFindFirst } from "@gadgetinc/react";
import {
  Layout,
  Page,
  Spinner,
  Text,
  Card,
  BlockStack,
  MediaCard,
  List,
} from "@shopify/polaris";
import { api } from "../api";
import SetupWizard from "../components/setupWizard/SetupWizard";
import { useMantle } from "@heymantle/react";
import { ExternalIcon } from "@shopify/polaris-icons";
import SoofImage from "../public/soof-on-iphone.png";
import { useTranslation } from 'react-i18next';

export default function OverviewPage() {
  const { t } = useTranslation();
  const { subscription, customer, plans } = useMantle();
  const [{ data, fetching, error }] = useFindFirst(api.shopifyShop, {
    select: {
      id: true,
      name: true,
      myshopifyDomain: true,
      setupCompleted: true,
    },
    live: true,
  });

  if (error) {
    return (
      <Page title={t('Error')}>
        <Text variant="bodyMd" as="p">
          {error.message}
        </Text>
      </Page>
    );
  }

  if (fetching) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Spinner accessibilityLabel={t('Loading')} size="large" />
      </div>
    );
  }

  return (
    <Page title={t('routes.overview.pageTitle')}>
      <Layout>
        {/* Setup Wizard */}
        {data.setupCompleted ? (
          <Layout.Section>
            <SetupWizard data={data} />
          </Layout.Section>
        ) : (
          <>
            <Layout.Section>
              <MediaCard
                title={t('routes.overview.mediaCard.title')}
                primaryAction={{
                  content: t('routes.overview.mediaCard.primaryAction.content'),
                  icon: ExternalIcon,
                  url: `https://docs.soof.ai/`,
                  target: '_blank',
                }}
                description={
                  <List type="bullet">
                    <List.Item>{t('routes.overview.mediaCard.description.item1')}</List.Item>
                    <List.Item>{t('routes.overview.mediaCard.description.item2')}</List.Item>
                    <List.Item>{t('routes.overview.mediaCard.description.item3')}</List.Item>
                  </List>
                }
                size='small'
              >
                <BlockStack align="center" inlineAlign="center">
                  <img
                    alt={t('routes.overview.mediaCard.imageAlt')}
                    width="50%"
                    height="100%"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    src={SoofImage}
                  />
                </BlockStack>
              </MediaCard>
            </Layout.Section>

            <Layout.Section>
              <Card title={t('routes.overview.chatSessions.title')} sectioned>
                <BlockStack align='center' inlineAlign='center' gap="200">
                  <Text variant='headingLg' as="h3">
                    {t('routes.overview.chatSessions.chatUsage')}
                  </Text>
                  <Text variant='headingMd' as="p">
                    {customer?.usage.Chats.currentValue}
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          </>
        )}
      </Layout>
    </Page >
  );
}