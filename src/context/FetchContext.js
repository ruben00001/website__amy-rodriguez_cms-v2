import React, { createContext, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FetchContext = createContext();
const { Provider } = FetchContext;

const FetchProvider = ({ children }) => {
  const {
    authState: { token },
  } = useAuth();

  // const baseURL = 'https://amyrodriguezcms.herokuapp.com';
  const baseURL = useMemo(
    () =>
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:1337/'
        : 'https://amyrodriguezcms.herokuapp.com',
    []
  );

  const publicFetch = useMemo(
    () =>
      axios.create({
        baseURL,
      }),
    [baseURL]
  );

  const authFetch = useMemo(
    () =>
      axios.create({
        baseURL,
      }),
    [baseURL]
  );
  authFetch.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${token}`;

      if (config.method === 'get') {
        config.params = { ...config?.params, _limit: '1000000' };
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const authFormFetch = useMemo(
    () =>
      axios.create({
        baseURL,
        headers: {
          patch: {
            'Content-Type': 'multippart/form-data',
          },
        },
      }),
    [baseURL]
  );
  authFormFetch.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const strapiEndpoints = {
    login: 'auth/local',
    images: 'images',
    uploads: 'upload/files',
    portfolio: 'portfolio-pages',
    shopHeights: 'shop-home-heights',
    products: 'products',
    press: 'press-elements',
    settings: 'settings',
  };

  return (
    <Provider
      value={{
        publicFetch,
        authFetch,
        authFormFetch,
        strapiEndpoints,
      }}
    >
      {children}
    </Provider>
  );
};

function useFetch() {
  const context = useContext(FetchContext);
  if (!context)
    throw new Error('useFetch must be used within the FetchProvider');

  return context;
}

export { FetchProvider, useFetch };
