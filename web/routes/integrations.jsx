import React from 'react';
import { Layout, Page } from '@shopify/polaris';
import ExactOnline from '../components/integrations/ExactOnline';

export default function IntegrationsLayout() {
  return (
    <Page title='Integrations'>
      <Layout>
        <Layout.AnnotatedSection
          title='Exact Online'
          description='Connect your Exact Online account to your Assistant.'
        >
          <ExactOnline />
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}
