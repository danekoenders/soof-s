import { useFindFirst } from "@gadgetinc/react";
import { useMantle } from "@heymantle/react";
import { Banner, BlockStack, Layout, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { ClockIcon, CursorIcon } from "@shopify/polaris-icons";

export default function NoticeHeader() {
    const navigate = useNavigate();
    const { subscription } = useMantle();
    const [{ data, fetching, error }] = useFindFirst(api.shopifyShop, {
        select: {
            name: true,
        },
        live: true,
    });

    if (fetching) {
        return null;
    }

    if (error) {
        return (
            <Layout.Section>
                <Banner title="An error occured" tone="critical">{error.message}</Banner>
            </Layout.Section>
        );
    }

    return (
        <>
            {subscription && subscription.active === false && (new Date() > new Date(subscription.trialExpiresAt)) && (
                <Layout.Section>
                    <BlockStack gap="400">
                        <Banner
                            title="Your free trial has ended."
                            tone="warning"
                            icon={ClockIcon}
                            action={{
                                content: "Subscribe",
                                icon: CursorIcon,
                                onClick: () => navigate("/plans"),
                            }}
                        >
                            <Text variant="bodyMd" as="p">
                                Please select a plan to continue using our services.
                            </Text>
                        </Banner>
                    </BlockStack>
                </Layout.Section>
            )}
        </>
    );
}