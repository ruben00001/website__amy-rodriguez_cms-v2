import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FetchContext = createContext();
const { Provider } = FetchContext;

const FetchProvider = ({ children }) => {
  const {
    authState: { token },
  } = useAuth();
  const authFetch = axios.create({
    baseURL: 'https://amyrodriguezcms.herokuapp.com',
    // baseURL: process.env.REACT_APP_API_URL,
  });

  authFetch.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const authFormFetch = axios.create({
    baseURL: 'https://amyrodriguezcms.herokuapp.com',
    headers: {
      patch: {
        'Content-Type': 'multippart/form-data',
      },
    },
  });

  authFormFetch.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return (
    <Provider
      value={{
        authFetch,
        authFormFetch,
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
