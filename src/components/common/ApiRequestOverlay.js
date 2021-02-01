/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
// import { faCheck } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoadingBar from './LoadingBar';

const container = css({
  position: 'fixed',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'opacity 0.3s ease-in-out',
});

const overlay = (theme) =>
  css({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.lightmidgrey,
    opacity: 0.7,
  });

const transitionIn = css({
  opacity: 1,
  zIndex: 1000,
});

const transitionOut = css({
  opacity: 0,
  zIndex: -1,
});

function ApiRequestOverlay({ status }) {
  return (
    <div css={[container, status !== 'idle' ? transitionIn : transitionOut]}>
      <LoadingBar status={status} />
      <div css={overlay}></div>
    </div>
  );
}

export default ApiRequestOverlay;
