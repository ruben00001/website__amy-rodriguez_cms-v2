/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React from 'react';
import loadingGif from '../../images/loading_spinning-bar-rainbow.gif';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { button } from './styles';
import { Link } from 'react-router-dom';

const container = css({
  zIndex: 1000,
  position: 'fixed',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
});

const content = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '40%',
  minHeight: '40vw',
  backgroundColor: 'white',
});

const transitionOutStyle = css({
  opacity: 0,
  transition: 'opacity 0.1s ease-out',
  transitionDelay: '0.5s',
});

const doneContainer = css({
  display: 'flex',
  alignItems: 'center',
});

const doneIcon = (theme) =>
  css({
    color: theme.colors.green,
    marginLeft: 15,
  });

const problemLoadingContainer = css({
  display: 'flex',
  alignItems: 'center',

  button: {
    position: 'relative',
    fontVariant: 'small-caps',
    marginLeft: 20,
    border: '1px solid black',
    borderRadius: 2,
    backgroundColor: 'white',
  },
});

const fetchAttemptsStyle = (theme) =>
  css({
    position: 'absolute',
    top: -7,
    left: 0,
    fontSize: 11,
    transform: 'translateY(-100%)',
    whiteSpace: 'nowrap',
    fontVariant: 'normal',
    color: theme.colors.darkblue,
  });

const linkStyle = (theme) =>
  css({
    color: theme.colors.purple,
  });

function LoadingOverlay({ page, fetchStatus, fetchData }) {
  const [dataFetchAttempts, setDataFetchAttempts] = useState(1);

  const links = ['portfolio', 'shop', 'press'];

  function Links() {
    return links
      .filter((link) => link !== page)
      .map((link, i) => (
        <Link css={[button, linkStyle]} to={`/${link}`} key={i}>
          {link}
        </Link>
      ));
  }

  return (
    <div css={[container, fetchStatus === 'resolved' && transitionOutStyle]}>
      <div css={content}>
        {(fetchStatus === 'idle' || fetchStatus === 'pending') && (
          <React.Fragment>
            <img
              css={[
                fetchStatus === 'resolved' && {
                  opacity: 0,
                  transition: 'opacity 0.3s ease-out',
                },
              ]}
              src={loadingGif}
              alt=""
            />
            <p>
              {dataFetchAttempts > 1
                ? 'Attempting to fetch data again. Please wait.'
                : 'Setting up data. This could take a few minutes.'}
            </p>
          </React.Fragment>
        )}
        {fetchStatus === 'resolved' && (
          <div css={doneContainer}>
            <p>Data loaded.</p>
            <FontAwesomeIcon css={doneIcon} icon={faCheck} />
          </div>
        )}
        {fetchStatus === 'rejected' && (
          <div>
            <div css={problemLoadingContainer}>
              <p>
                {dataFetchAttempts > 1
                  ? 'There was a problem fetching the data again.'
                  : 'There was a problem fetching the data.'}
              </p>
              <button
                css={button}
                onClick={() => {
                  fetchData();
                  setDataFetchAttempts((attempts) => attempts + 1);
                }}
              >
                try again
                {dataFetchAttempts > 1 && (
                  <p css={fetchAttemptsStyle}>Attempts: {dataFetchAttempts}</p>
                )}
              </button>
            </div>
            {dataFetchAttempts > 1 && (
              <React.Fragment>
                <p css={{ marginTop: 30, marginBottom: 10 }}>
                  If the problem persists, please contact Ruben. Other pages may
                  be working:
                </p>
                {<Links />}
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;
