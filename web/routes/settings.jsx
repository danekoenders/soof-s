import React, { useState } from 'react';
import { Page, Tabs } from '@shopify/polaris';
import GeneralSettings from '../components/settings/GeneralSettings';
import KnowledgeSettings from '../components/settings/KnowledgeSettings';

export default function ChatbotLayout() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex);

  const tabs = [
    { id: 'general', content: 'General' },
    { id: 'knowledge', content: 'Knowledge' },
  ];

  return (
    <Page title='Edit Assistant'>
      <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
        {selectedTab === 0 && <GeneralSettings />}
        {selectedTab === 1 && <KnowledgeSettings />}
      </Tabs>
    </Page>
  );
}
