import { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { FourOFour, Landing, Login, Portfolio, Product, Shop } from './pages';
import { globalCSSTheme } from './emotion/themes';
import { GlobalCSS } from './emotion/GlobalCSS';
import { FetchProvider } from './context/FetchContext';
import { DataProvider } from './context/DataContext';
import { DeployProvider } from './context/DeployContext';

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

function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/">
          <Login />
        </Route>
        <AuthenticatedRoute path="/landing">
          <Landing />
        </AuthenticatedRoute>
        <AuthenticatedRoute path="/portfolio">
          <Portfolio />
        </AuthenticatedRoute>
        <AuthenticatedRoute path="/shop">
          <Shop />
        </AuthenticatedRoute>
        <AuthenticatedRoute path="/product">
          <Product />
        </AuthenticatedRoute>
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
          <DataProvider>
            <ThemeProvider theme={globalCSSTheme}>
              <GlobalCSS />
              <DeployProvider>
                <AppRoutes />
              </DeployProvider>
            </ThemeProvider>
          </DataProvider>
        </FetchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
