import React, { useState } from 'react';
import { Layout, Page, Tabs } from '@shopify/polaris';
import GeneralSettings from '../components/settings/GeneralSettings';
import KnowledgeSettings from '../components/settings/KnowledgeSettings';
import NoticeHeader from '../components/shared/NoticeHeader';
import { useTranslation } from 'react-i18next';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex);

  const tabs = [
    { id: 'general', content: t('routes.settings.general') },
    { id: 'knowledge', content: t('routes.settings.knowledge') },
  ];

  return (
    <Page title={t('routes.settings.pageTitle')}>
      <Layout>
        <NoticeHeader />
        <Layout.Section>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
            {selectedTab === 0 && <GeneralSettings />}
            {selectedTab === 1 && <KnowledgeSettings />}
          </Tabs>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
