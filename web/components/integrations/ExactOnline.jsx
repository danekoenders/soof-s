import {
  Link,
  AccountConnection,
  BlockStack,
  Banner,
  Layout,
  Card,
  SkeletonDisplayText,
  SkeletonBodyText,
  Text,
} from '@shopify/polaris';
import { useEffect, useState, useRef } from 'react';
import { api } from '../../api';
import { useAction, useFindFirst } from '@gadgetinc/react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExactOnline() {
  const { t } = useTranslation();
  const [{ data, error, fetching }] = useFindFirst(api.shopifyShop, {
    select: {
      name: true,
      myshopifyDomain: true,
      exactOnline: {
        id: true,
        state: true,
      },
    },
    live: true,
  });

  const [{ data: updateTokenData, error: updateTokenError, fetching: updateTokenFetching }, updateToken] = useAction(api.integrations.exactOnline.updateToken);
  const [{ data: updateData, error: updateError, fetching: updateFetching }, update] = useAction(api.integrations.exactOnline.update);

  const baseUrl = process.env.GADGET_PUBLIC_EXACT_ONLINE_BASE_URL;
  const redirectUri = `${window.location.origin}/callbacks/exactOnline`;
  const clientId = process.env.GADGET_PUBLIC_EXACT_ONLINE_CLIENT_ID;

  const [connected, setConnected] = useState(false);
  const hasUpdatedToken = useRef(false);

  const [searchParams] = useSearchParams();
  const callback = searchParams.get('callback');
  const code = searchParams.get('code');

  const accountName = connected && data ? data.name : '';

  const [updateTokenErrorState, setUpdateTokenErrorState] = useState(null);

  useEffect(() => {
    if (
      !hasUpdatedToken.current &&
      callback === 'exactOnline' &&
      code &&
      data &&
      data.exactOnline &&
      data.exactOnline.state !== 'has-token'
    ) {
      const handleCallback = async () => {
        try {
          await updateToken({
            id: data.exactOnline.id,
            code: code,
          });
          hasUpdatedToken.current = true;
        } catch (err) {
          console.error('Error updating token:', err);
          setUpdateTokenErrorState(err);
        }
      };

      handleCallback();
    }
  }, [callback, code, data]);

  useEffect(() => {
    if (data && data.exactOnline && data.exactOnline.state === 'has-token') {
      setConnected(true);
    } else {
      setConnected(false);
    }
  }, [data]);

  const handleAction = async () => {
    if (connected) {
      try {
        await update({
          id: data.exactOnline.id,
          state: 'disconnected',
        });

        const cookieName = '_myshopifyDomain';
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=None;Secure`;

        setConnected(false);
      } catch (err) {
        console.error('Error disconnecting:', err);
      }
    } else {
      if (data && data.myshopifyDomain) {
        const cookieName = '_myshopifyDomain';
        const cookieValue = data.myshopifyDomain;
        const expires = new Date();
        expires.setTime(expires.getTime() + 10 * 60 * 1000);

        document.cookie = `${cookieName}=${encodeURIComponent(
          cookieValue
        )};expires=${expires.toUTCString()};path=/;SameSite=None;Secure`;

        const url = `${baseUrl}/api/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&force_login=0`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const buttonText = connected ? t('components.integrations.ExactOnline.buttonText.disconnect') : t('components.integrations.ExactOnline.buttonText.connect');
  const details = connected ? t('components.integrations.ExactOnline.details.connected') : t('components.integrations.ExactOnline.details.disconnected');
  const terms = connected ? null : (
    <Text>
      {t('components.integrations.ExactOnline.terms.first')} <strong>{t('components.integrations.ExactOnline.terms.second')}</strong> {t('components.integrations.ExactOnline.terms.third')}{' '}
      <Link target="_blank" url="https://soof.ai/terms-of-service-shopify-app/">{t('components.integrations.ExactOnline.terms.linkText')}</Link>
    </Text>
  );

  const isUpdating = updateTokenFetching || updateFetching;
  const hasError = updateTokenError || updateError || updateTokenErrorState;
  const errorMessage = updateTokenError?.message || updateError?.message || updateTokenErrorState?.message;

  if (fetching) {
    return (
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap={400}>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    );
  }

  return (
    <BlockStack gap={200}>
      <AccountConnection
        accountName={accountName}
        connected={connected}
        title="Exact Online Account"
        action={{
          content: buttonText,
          onAction: handleAction,
        }}
        details={details}
        termsOfService={terms}
      />
      {isUpdating && <Banner tone="info">{t('components.integrations.ExactOnline.updating')}</Banner>}
      {hasError && <Banner tone="critical">Error: {errorMessage}</Banner>}
    </BlockStack>
  );
}
