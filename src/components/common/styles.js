import { css } from '@emotion/react';

const button = css({
  padding: 4,
  cursor: 'pointer',
  boxSizing: 'content-box',

  '&:hover': { opacity: 0.8 },
  '&:active': { opacity: 1 },
});

const transitionDurationAndTiming = '0.1s ease-in-out';

const fetchDisable = css({
  opacity: 0.5,
  pointerEvents: 'none',
});

export { button, transitionDurationAndTiming, fetchDisable };
