/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { createPlaceholderArray } from '../../utils';

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

export function PageNumbers({ numberPages }) {
  const placeholderArray = createPlaceholderArray(
    numberPages < 6 ? numberPages - 1 : 5
  );

  return (
    <div css={container}>
      {placeholderArray.map((_element, i) => (
        <div css={pagePlaceholder} key={i}>
          <p css={pageNumber}>page {i + 1}</p>
        </div>
      ))}
      {numberPages > 3 && (
        <div css={pagePlaceholder}>
          <p css={pageNumber}>etc.</p>
        </div>
      )}
    </div>
  );
}
