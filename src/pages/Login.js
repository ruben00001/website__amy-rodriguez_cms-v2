/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, { useLayoutEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

import { useAuth } from '../context/AuthContext';
import { useFetch } from '../context/FetchContext';

import Input from '../components/login/Input';
import LoadingBar from '../components/common/LoadingBar';
import Logo from '../components/common/Logo';

import { button } from '../components/common/styles';
import { transitionDurationAndTiming } from '../components/login/styles';

const container = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
});

const content = (theme) =>
  css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: `1px solid ${theme.colors.lightgrey}`,
    borderRadius: 8,
    overflow: 'hidden',
    padding: '58px 40px 65px 40px',
  });

const pageTitle = (theme) =>
  css({
    fontFamily: theme.fonts.title,
    fontWeight: 500,
    marginTop: 20,
  });

const form = css({
  marginTop: 42,
  display: 'flex',
  flexDirection: 'column',
});

const disableForm = css({
  pointerEvents: 'none',
});

const submitButton = (theme) =>
  css({
    padding: '11px 18px',
    width: '50px',
    fontWeight: 600,
    letterSpacing: 0.3,
    marginTop: 45,
    borderRadius: 4,
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.yellow,
    color: 'white',
  });

const disableSubmit = css({
  opacity: 0.5,
  cursor: 'default',
});

const inputMessage = css({
  position: 'absolute',
  bottom: 120,
  marginTop: 5,
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  opacity: 0,
  transition: `opacity ${transitionDurationAndTiming}, color ${transitionDurationAndTiming}`,
});

const errorMessage = (theme) =>
  css({
    color: theme.input.rejected,
    opacity: 1,
  });

const signedInMessage = (theme) =>
  css({
    color: theme.input.resolved,
    opacity: 1,
  });

const redirectMessage = css({
  display: 'flex',
  justifyContent: 'center',
  position: 'absolute',
  top: 15,
  transform: 'translateY(calc(-100% - 15px))',
  borderRadius: 4,
  width: '60%',
  padding: '12px 0',
  backgroundColor: 'rgba(242, 47, 45, 0.2)',
  fontSize: 14,
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
});

const redirectMessageIcon = css({
  marginRight: '15px',
  color: 'rgb(242, 47, 45)',
  fontSize: 16,
});

const transitionRedirectMessage = css({
  opacity: 1,
  transform: 'translateY(0)',
});

/* NOTES
  - LocalHost Strapi p'word: Abc123456
  - localhost frontend p'word: abc123 
*/

function Login() {
  const [loginStatus, setLoginStatus] = useState(null);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const { publicFetch, strapiEndpoints } = useFetch();
  const { isAuthenticated, setAuthState } = useAuth();
  const {
    state: { redirectedFromAuthenticatedRoute } = {
      redirectedFromAuthenticatedRoute: false,
    },
  } = useLocation();

  useLayoutEffect(() => {
    if (redirectedFromAuthenticatedRoute) {
      setShowRedirectMessage(true);
      setTimeout(() => {
        setShowRedirectMessage(false);
      }, 3800);
    }
  }, [redirectedFromAuthenticatedRoute]);

  async function submit(e) {
    e.preventDefault();
    const identifier = e.target.email.value;
    const password = e.target.password.value;
    try {
      setLoginStatus('pending');
      const { data } = await publicFetch.post(strapiEndpoints.login, {
        identifier,
        password,
      });
      setLoginStatus('resolved');
      setAuthState(data);
    } catch (error) {
      setLoginStatus('rejected');
      resetForm();
    }
  }

  function resetForm() {
    setTimeout(() => {
      setLoginStatus(null);
    }, 2000);
  }

  return (
    <React.Fragment>
      {isAuthenticated() && <Redirect to="/landing" />}
      <div css={container}>
        <div css={content}>
          {loginStatus && <LoadingBar status={loginStatus} />}
          <Logo />
          <h2 css={pageTitle}>Sign in</h2>
          <form
            css={[
              form,
              (loginStatus === 'pending' || loginStatus === 'resolved') &&
                disableForm,
            ]}
            onSubmit={submit}
          >
            <Input type="email" loginStatus={loginStatus} />
            <Input type="password" loginStatus={loginStatus} />
            <p
              css={[
                inputMessage,
                loginStatus === 'resolved' && signedInMessage,
                loginStatus === 'rejected' && errorMessage,
              ]}
            >
              <FontAwesomeIcon
                icon={
                  loginStatus === 'resolved' ? faCheck : faExclamationCircle
                }
                style={{ marginRight: '5px' }}
              />
              {loginStatus === 'resolved'
                ? 'Signing in...'
                : loginStatus === 'rejected'
                ? 'Incorrect email or password'
                : ''}
            </p>
            <input
              css={[
                button,
                submitButton,
                (loginStatus === 'pending' || loginStatus === 'resolved') &&
                  disableSubmit,
              ]}
              type="submit"
              value="Launch"
            />
          </form>
        </div>
        <div
          css={[
            redirectMessage,
            showRedirectMessage && transitionRedirectMessage,
          ]}
        >
          <FontAwesomeIcon
            icon={faExclamationCircle}
            css={redirectMessageIcon}
          />
          <p>You must sign in to visit that page</p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Login;
