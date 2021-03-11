/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';

const pageFold = css({
  borderTop: '2px dashed #e8e8e8',
  position: 'absolute',
  height: 2,
  width: '100%',

  p: {
    position: 'absolute',
    right: '-5px',
    fontSize: 10,
    transform: 'translate(100%, -50%)',

    color: '#999999',
  },
});

function PageFold({ top }) {
  return (
    <div css={[pageFold, { top }]}>
      <p>Page fold</p>
    </div>
  );
}

export default PageFold;
