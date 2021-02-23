/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css, keyframes } from '@emotion/react';

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

function LoadingBar({ status }) {
  return (
    <div css={[container, status === 'idle' && { opacity: 0 }]}>
      <div
        css={[
          movingBar,
          status === 'pending' && pending,
          status === 'resolved' && resolved,
          status === 'rejected' && rejected,
        ]}
      />
    </div>
  );
}

export default LoadingBar;
