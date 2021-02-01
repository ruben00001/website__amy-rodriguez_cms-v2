import React, { createContext, useState } from 'react';
import { useContext } from 'react';
import { useHistory } from 'react-router';

const AuthContext = createContext();
const { Provider } = AuthContext;

const AuthProvider = ({ children }) => {
  // * should be in useEffect as is a side-effect (and probably a hook)
  const history = useHistory();
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('expiresAt');

  const [authState, setAuthState] = useState({
    token,
    expiresAt,
  });

  function setAuthInfo({ jwt: token }) {
    setTimeout(() => {
      localStorage.setItem('token', token);

      const jwtExpirationLength = 86400; // 24h
      const expiresAt = Math.floor(Date.now() / 1000) + jwtExpirationLength;
      localStorage.setItem('expiresAt', expiresAt);

      setAuthState({
        token,
        expiresAt,
      });
    }, 2000);
  }

  function isAuthenticated() {
    if (!authState.token || !authState.expiresAt) {
      return false;
    }
    return new Date().getTime() / 1000 < authState.expiresAt;
  }

  function confirmLogout() {
    const message =
      'Are you sure you wish to logout? Any unsaved changes will be lost';
    const confirm = window.confirm(message);
    if (confirm) {
      return true;
    }
  }

  function logout() {
    if (!confirmLogout()) {
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('expiresAt');
    setAuthState({
      token: null,
      expiresAt: {},
    });
    history.push('/');
  }

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authInfo) => setAuthInfo(authInfo),
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </Provider>
  );
};

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within the AuthProvider');

  return context;
}

export { AuthProvider, useAuth };
