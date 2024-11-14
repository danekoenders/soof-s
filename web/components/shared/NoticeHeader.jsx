import { useFindFirst } from "@gadgetinc/react";
import { useMantle } from "@heymantle/react";
import { Banner, BlockStack, Layout, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { ClockIcon, CursorIcon } from "@shopify/polaris-icons";
import { useTranslation } from "react-i18next";

export default function NoticeHeader() {
    const { t } = useTranslation();
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
                            title={t("components.shared.NoticeHeader.trialEnd.title")}
                            tone="warning"
                            icon={ClockIcon}
                            action={{
                                content: t("components.shared.NoticeHeader.trialEnd.action"),
                                icon: CursorIcon,
                                onClick: () => navigate("/plans"),
                            }}
                        >
                            <Text variant="bodyMd" as="p">
                                {t("components.shared.NoticeHeader.trialEnd.message")}
                            </Text>
                        </Banner>
                    </BlockStack>
                </Layout.Section>
            )}
        </>
    );
}