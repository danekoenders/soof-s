import {
  AppType,
  Provider as GadgetProvider,
  useGadget,
} from "@gadgetinc/react-shopify-app-bridge";
import { NavMenu } from "@shopify/app-bridge-react";
import { Page, Spinner, Text, Card } from "@shopify/polaris";
import { useEffect } from "react";
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
  useNavigate,
  Link,
  useSearchParams
} from "react-router-dom";
import Index from "../routes/index";
import PlansPage from "../routes/plans";
import { api } from "../api";
import { MantleProvider } from "@heymantle/react";
import { useFindFirst } from "@gadgetinc/react";
import ChatsLayout from "../routes/chats";
import IntegrationsLayout from "../routes/integrations";
import SettingsLayout from "../routes/settings";
import ChatDetail from "./chats/ChatDetail";
import CallbacksLayout from "../routes/callbacks";
import ExactOnline from "./callbacks/ExactOnline";
import i18n from "../utils/i18next";
import { useTranslation } from 'react-i18next';


function Error404() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const appURL = process.env.GADGET_PUBLIC_SHOPIFY_APP_URL;

  useEffect(() => {
    if (appURL && location.pathname === new URL(appURL).pathname) {
      navigate('/', { replace: true });
    }
  }, [location.pathname]);

  return <div>{t('app.notFound')}</div>;
}

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="chats" element={<ChatsLayout />}>
          <Route path=":chatRef" element={<ChatDetail />} />
        </Route>
        <Route path="settings" element={<SettingsLayout />} />
        <Route path="integrations" element={<IntegrationsLayout />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="callbacks" element={<CallbacksLayout />}>
          <Route path="exactOnline" element={<ExactOnline />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

function Layout() {
  return (
    <GadgetProvider
      type={AppType.Embedded}
      shopifyApiKey={window.gadgetConfig.apiKeys.shopify}
      api={api}
    >
      <AuthenticatedApp />
    </GadgetProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useGadget();
  if (loading) {
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
  return isAuthenticated ? <EmbeddedApp /> : <UnauthenticatedApp />;
}

function EmbeddedApp() {
  const [{ data, fetching }] = useFindFirst(api.shopifyShop, {
    select: {
      mantleApiToken: true,
    }
  });
  const [searchParams] = useSearchParams();
  const locale = searchParams.get('locale') || 'en'; // Default to 'en' if not specified

  const { t } = useTranslation();

  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  if (fetching) {
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
        <Spinner accessibilityLabel="Spinner" size="large" />
      </div>
    );
  }

  return (
    <MantleProvider
      appId={process.env.GADGET_PUBLIC_MANTLE_APP_ID}
      customerApiToken={data?.mantleApiToken}
    >
      <Outlet />
      <NavMenu>
        <Link to="/" rel="home">{t('app.navigation.overview')}</Link>
        <Link to="/chats">{t('app.navigation.chats')}</Link>
        <Link to="/settings">{t('app.navigation.settings')}</Link>
        <Link to="/integrations">{t('app.navigation.integrations')}</Link>
        <Link to="/plans">{t('app.navigation.plans')}</Link>
      </NavMenu>
    </MantleProvider>
  );
}

function UnauthenticatedApp() {
  const { t } = useTranslation();
  return (
    <Page>
      <div style={{ height: "80px" }}>
        <Card padding="500">
          <Text variant="headingLg" as="h1">
            {t('app.unauthenticated.title')}
          </Text>
          <Outlet />
        </Card>
      </div>
    </Page>
  );
}

export default App;
