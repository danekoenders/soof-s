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
  Link
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

function Error404() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const appURL = process.env.GADGET_PUBLIC_SHOPIFY_APP_URL;

    if (appURL && location.pathname === new URL(appURL).pathname) {
      navigate("/", { replace: true });
    }
  }, [location.pathname]);

  return <div>404 not found</div>;
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
        <Spinner accessibilityLabel="Spinner example" size="large" />
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
        <Link to="/" rel="home">Shop Information</Link>
        <Link to="/chats">Chats</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/integrations">Integrations</Link>
        <Link to="/plans">Plans</Link>
      </NavMenu>
    </MantleProvider>
  );
}

function UnauthenticatedApp() {
  return (
    <Page>
      <div style={{ height: "80px" }}>
        <Card padding="500">
          <Text variant="headingLg" as="h1">
            App must be viewed in the Shopify Admin
          </Text>
          <Outlet />
        </Card>
      </div>
    </Page>
  );
}

export default App;
