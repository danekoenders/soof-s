import { useFindFirst } from "@gadgetinc/react";
import {
  Layout,
  Page,
  Spinner,
  Text,
  Banner,
  Image,
  Card,
  BlockStack,
  MediaCard,
  List,
  Box,
} from "@shopify/polaris";
import { api } from "../api";
import SetupWizard from "../components/setupWizard/SetupWizard";
import { useMantle } from "@heymantle/react";
import { ExternalIcon } from "@shopify/polaris-icons";
import SoofImage from "../public/soof-on-iphone.png"

export default function OverviewPage() {
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
      <Page title="Error">
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
        <Spinner accessibilityLabel="Loading" size="large" />
      </div>
    );
  }

  return (
    <Page title="Overview">
      <Layout>
        {/* Setup Wizard */}
        {!data.setupCompleted ? (
          <Layout.Section>
            <SetupWizard data={data} />
          </Layout.Section>
        ) : (
          <>
            <Layout.Section>
              <MediaCard
                title="Getting Started"
                primaryAction={{
                  content: 'Getting started',
                  icon: ExternalIcon,
                  url: `https://docs.soof.ai/`,
                  target: '_blank',
                }}
                description={
                  <List type="bullet">
                    <List.Item>Engage your customers like never before.</List.Item>
                    <List.Item>Increase sales with personalized interactions.</List.Item>
                    <List.Item>24/7 customer support without extra staff.</List.Item>
                  </List>
                }
                size='small'
              >
                <BlockStack align="center" inlineAlign="center">
                  <img
                    alt="Soof on iPhone"
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
              <Card title="Chat Sessions" sectioned>
                <BlockStack align='center' inlineAlign='center' gap="200">
                <Text variant='headingLg' as="h3">
                  Chat usage
                </Text>
                <Text variant='headingMd'  as="p">
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