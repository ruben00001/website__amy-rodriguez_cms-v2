/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css, keyframes } from '@emotion/react';
import React from 'react';
import { faCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { transitionDurationAndTiming } from './styles';

const container = (theme) =>
  css({
    zIndex: 500,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    height: 7,
    backgroundColor: theme.colors.lightlightgrey,
    transition: 'opacity 0.3s ease-in-out',
    overflowX: 'hidden',
  });

const moveBar = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
`;

const movingBar = css({
  width: '40%',
  height: 'inherit',
  borderTopRightRadius: 8,
  borderTopLeftRadius: 8,
  transform: 'translateX(-100%)',
  animation: `${moveBar} 3s infinite`,
  transition: `background-color ${transitionDurationAndTiming}`,
});

const pending = (theme) =>
  css({
    backgroundColor: theme.input.pending,
  });

const resolved = (theme) =>
  css({
    backgroundColor: theme.input.resolved,
    animationPlayState: 'paused',
  });

const rejected = (theme) =>
  css({
    backgroundColor: theme.input.rejected,
    animationPlayState: 'paused',
  });

const statusText = css({
  position: 'fixed',
  left: '50%',
  top: 80,
  display: 'flex',
  alignItems: 'center',
  transform: 'translateX(-50%)',
  transition: 'opacity 0.2s ease-in-out',
  fontVariant: 'small-caps',
});

const statusIconResolved = (theme) =>
  css({
    color: theme.input.resolved,
    marginLeft: 8,
  });

const statusIconRejected = (theme) =>
  css({
    color: theme.input.rejected,
    marginLeft: 8,
  });

function LoadingBar({ status, showStatusText }) {
  return (
    <div
      css={[
        container,
        (status === 'idle' || status === 'complete') && {
          opacity: 0,
        },
      ]}
    >
      <div
        css={[
          movingBar,
          status === 'pending' && pending,
          status === 'resolved' && resolved,
          status === 'rejected' && rejected,
        ]}
      />
      {showStatusText && (
        <div css={[statusText]}>
          {status === 'resolved' && (
            <React.Fragment>
              <p>done</p>
              <FontAwesomeIcon css={statusIconResolved} icon={faCheck} />
            </React.Fragment>
          )}
          {status === 'rejected' && (
            <React.Fragment>
              <p>something went wrong</p>
              <FontAwesomeIcon css={statusIconRejected} icon={faTimesCircle} />
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

export default LoadingBar;
