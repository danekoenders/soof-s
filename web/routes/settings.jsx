import React, { useState } from 'react';
import { Layout, Page, Tabs } from '@shopify/polaris';
import GeneralSettings from '../components/settings/GeneralSettings';
import KnowledgeSettings from '../components/settings/KnowledgeSettings';
import NoticeHeader from '../components/shared/NoticeHeader';

export default function SettingsLayout() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex);

  const tabs = [
    { id: 'general', content: 'General' },
    { id: 'knowledge', content: 'Knowledge' },
  ];

  return (
    <Page title='Edit Assistant'>
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
