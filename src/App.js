import { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

import { FetchProvider } from './context/FetchContext';
import { DataProvider, useData } from './context/DataContext';
import { DeployProvider } from './context/DeployContext';

import { AuthProvider, useAuth } from './context/AuthContext';
import {
  FourOFour,
  Landing,
  Login,
  Product,
  Shop,
  PortfolioLanding,
  PortfolioPage,
  Press,
} from './pages';

import { globalCSSTheme } from './emotion/themes';
import { GlobalCSS } from './emotion/GlobalCSS';

const AuthenticatedRoute = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  return (
    <Route
      {...rest}
      render={() =>
        isAuthenticated() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/',
              state: { redirectedFromAuthenticatedRoute: true },
            }}
          />
        )
      }
    />
  );
};

function PortfolioRoutes() {
  const { path } = useRouteMatch();
  const { portfolioRoot } = useData();

  return (
    <Switch>
      <Route exact path={path}>
        <PortfolioLanding />
      </Route>
      {portfolioRoot.data && (
        <Route path={`${path}/:pageId`}>
          <PortfolioPage />
        </Route>
      )}
      <Route render={() => <Redirect to="/portfolio" />} />
    </Switch>
  );
}

function ShopRoutes() {
  const { path } = useRouteMatch();
  const { shopifyProducts } = useData();
  return (
    <Switch>
      <Route exact path={path}>
        <Shop />
      </Route>
      {shopifyProducts.data && (
        <Route path={`${path}/:pageId`}>
          <Product />
        </Route>
      )}
      <Route render={() => <Redirect to="/shop" />} />
    </Switch>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/">
          <Login />
        </Route>
        <DataProvider>
          <DeployProvider>
            <AuthenticatedRoute path="/landing">
              <Landing />
            </AuthenticatedRoute>
            <AuthenticatedRoute path="/portfolio">
              <PortfolioRoutes />
            </AuthenticatedRoute>
            <AuthenticatedRoute path="/shop">
              <ShopRoutes />
            </AuthenticatedRoute>
            <AuthenticatedRoute path="/press">
              <Press />
            </AuthenticatedRoute>
          </DeployProvider>
        </DataProvider>
        <Route path="*">
          <FourOFour />
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FetchProvider>
          <ThemeProvider theme={globalCSSTheme}>
            <GlobalCSS />

            <AppRoutes />
          </ThemeProvider>
        </FetchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
