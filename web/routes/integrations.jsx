import React from 'react';
import { Layout, Page } from '@shopify/polaris';
import ExactOnline from '../components/integrations/ExactOnline';
import NoticeHeader from '../components/shared/NoticeHeader';
import { useTranslation } from 'react-i18next';

export default function IntegrationsLayout() {
  const { t } = useTranslation();
  return (
    <Page title={t('routes.integrations.pageTitle')}>
      <Layout>
        <NoticeHeader />
        <Layout.AnnotatedSection
          title='Exact Online'
          description={t('routes.integrations.exactOnlineDescription')}
        >
          <ExactOnline />
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}
