import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FetchContext = createContext();
const { Provider } = FetchContext;

const FetchProvider = ({ children }) => {
  const {
    authState: { token },
  } = useAuth();

  const baseURL = 'https://amyrodriguezcms.herokuapp.com';
  // const baseURL = useMemo(
  //   () =>
  //     process.env.NODE_ENV === 'development'
  //       ? 'http://localhost:1337/'
  //       : 'https://amyrodriguezcms.herokuapp.com',
  //   []
  // );

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
      // config.headers.Authorization = `Bearer ${token}`;
      config.headers = Object.assign(
        {
          Authorization: `Bearer ${token}`,
        },
        config.headers
      );

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
      // config.headers.Authorization = `Bearer ${token}`;
      config.headers = Object.assign(
        {
          Authorization: `Bearer ${token}`,
        },
        config.headers
      );

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const mapFetches = (elements, method, contentType) =>
    elements.map((element) => {
      const fetch = authFetch[method];
      const endpointBase = strapiEndpoints[contentType];
      const endpoint =
        method === 'post' ? endpointBase : `${endpointBase}/${element.id}`;
      return fetch(endpoint, element);
    });

  const strapiEndpoints = {
    login: 'auth/local',
    images: 'images',
    uploads: 'upload/files',
    portfolio: 'portfolio-pages',
    shopHeights: 'shop-home-heights',
    products: 'products',
    press: 'press-elements',
    pressElementsPerRow: 'press-elements-per-rows',
    settings: 'settings',
  };

  return (
    <Provider
      value={{
        publicFetch,
        authFetch,
        authFormFetch,
        strapiEndpoints,
        mapFetches,
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
