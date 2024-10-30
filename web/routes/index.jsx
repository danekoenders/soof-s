import { useFindFirst, useQuery } from "@gadgetinc/react";
import {
  Layout,
  Page,
  Spinner,
  Text,
  Banner,
  AccountConnection,
  BlockStack,
  Link,
} from "@shopify/polaris";
import {
  ClockIcon,
  ConnectIcon,
} from '@shopify/polaris-icons';
import { api } from "../api";
import { useMantle } from '@heymantle/react';
import { useNavigate } from "react-router-dom";
import { TitleBar } from "@shopify/app-bridge-react";
import SetupWizard from "../components/setupWizard/SetupWizard";

const gadgetMetaQuery = `
  query {
    gadgetMeta {
      slug
      editURL
      environmentSlug
    }
  }
`;

export default function () {
  const navigate = useNavigate();
  const { subscription } = useMantle();
  const [{ data, fetching, error }] = useFindFirst(api.shopifyShop, {
    select: {
      name: true,
    },
    live: true,
  });
  const [{ data: metaData, fetching: fetchingGadgetMeta }] = useQuery({
    query: gadgetMetaQuery,
  });

  const connectionTerms = data?.connected ? null : (
    <p>
      By clicking <strong>Connect Store</strong>, you agree to accept Soof AI’s{' '}
      <Link target="_blank" url="https://soof.ai/terms">terms and conditions</Link>.
    </p>
  );

  if (error) {
    return (
      <Page title="Error">
        <Text variant="bodyMd" as="p">
          Error: {error.toString()}
        </Text>
      </Page>
    );
  }

  if (fetching || fetchingGadgetMeta) {
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
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    );
  }

  return (
    <Page title={"Overview"}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
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
            {subscription?.active ?
              <>
                <Banner
                  title="Store is connected"
                  tone="success"
                  icon={ConnectIcon}
                >
                  <Text variant="bodyMd" as="p">
                    Your store is actively connected to Soof AI. Edit the store by clicking the button below or visiting <Link target="_blank" url={`${process.env.GADGET_PUBLIC_SOOF_APP_DOMAIN}/dashboard/${data?.soofShopId}`}>app.soof.ai</Link>.
                  </Text>
                </Banner>
                <AccountConnection
                  accountName={data?.name}
                  connected={data?.connected}
                  title="Soof AI"
                  action={{
                    content: data?.connected ? "Settings" : "Connect Store",
                    onAction: handleStoreConnect,
                  }}
                  details={data?.connected ? `Store ${data?.soofShopId} is connected` : "No store connected"}
                  termsOfService={connectionTerms}
                />
              </>
              :
              <Banner
                title="You don't have an active subscription. Please select a plan, free trial available."
                action={{
                  content: 'Select Plan',
                  onAction: () => navigate('/plans')
                }}
                tone="warning"
              />
            }
          </BlockStack>
        </Layout.Section>
      </Layout>
      :
      <SetupWizard data={data} />
    </Page>
  );
}
