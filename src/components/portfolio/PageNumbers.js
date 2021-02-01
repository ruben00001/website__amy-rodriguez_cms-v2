/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';

const container = css({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'space-evenly',
  alignContent: 'flex-start',
  flexWrap: 'wrap',
});

const pagePlaceholder = css({
  position: 'relative',
  width: '27vw',
  height: '18vw',
  marginTop: 30,
});

const pageNumber = (theme) =>
  css({
    position: 'absolute',
    // transform: 'translateX(-100%) rotate(-90deg) ',
    transform: 'rotate(-90deg) translate(-50%, -25px)',
    transformOrigin: 'left top',
    top: '50%',
    left: 0,
    fontSize: 14,
    color: theme.colors.midgrey,
  });

export function PageNumbers() {
  return (
    <div css={container}>
      <div css={pagePlaceholder}>
        <p css={pageNumber}>page 1</p>
      </div>
      <div css={pagePlaceholder}>
        <p css={pageNumber}>page 2</p>
      </div>
      <div css={pagePlaceholder}>
        <p css={pageNumber}>page 3</p>
      </div>
      <div css={pagePlaceholder}>
        <p css={pageNumber}>page 4</p>
      </div>
      <div css={pagePlaceholder}>
        <p css={pageNumber}>page 5</p>
      </div>
      <div css={pagePlaceholder}>
        <p css={pageNumber}>etc.</p>
      </div>
    </div>
  );
}
