import { useFindFirst, useQuery } from "@gadgetinc/react";
import {
  Layout,
  Page,
  Spinner,
  Text,
} from "@shopify/polaris";
import { api } from "../api";
import SetupWizard from "../components/setupWizard/SetupWizard";
import NoticeHeader from "../components/shared/NoticeHeader";

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
  const [{ data, fetching, error }] = useFindFirst(api.shopifyShop, {
    select: {
      name: true,
      myshopifyDomain: true,
    },
    live: true,
  });
  const [{ data: metaData, fetching: fetchingGadgetMeta }] = useQuery({
    query: gadgetMetaQuery,
  });

  if (error) {
    return (
      <Page title="Error">
        <Text variant="bodyMd" as="p">{error.message}</Text>
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
        <NoticeHeader />
        <Layout.Section>
          <SetupWizard data={data} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
