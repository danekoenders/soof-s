import { useFindMany } from "@gadgetinc/react";
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
    // const [{ data: syncData, fetching: syncFetching, error: syncError }] = useFindMany(api.shopifySync, {
    //     select: {
    //         createdAt: true,
    //         state: true,
    //     },
    //     filter: {
    //         state: {
    //             inState: ["running"],
    //         }
    //     },
    //     live: true,
    // });

    if (syncError) {
        return (
            <Layout.Section>
                <Banner title="An error occured" tone="critical">{syncError.message}</Banner>
            </Layout.Section>
        );
    }

    return (
        <>
            {syncData && syncData.state === "running" && (
                <Layout.Section>
                    <BlockStack gap="400">
                        <Banner
                            title={"Syncing data"}
                            tone="info"
                            icon={ClockIcon}
                            action={{
                                content: "View sync",
                                icon: CursorIcon,
                            }}
                        >
                            <Text variant="bodyMd" as="p">
                                Syncing data from Shopify store
                            </Text>
                        </Banner>
                    </BlockStack>
                </Layout.Section>
            )}

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