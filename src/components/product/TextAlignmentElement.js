/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import ElementControls from '../common/ElementControls';

const container = (theme) =>
  css({
    position: 'relative',
    display: 'flex',
    height: '100%',
    borderLeft: `1px dashed ${theme.colors.midgrey}`,
  });

function TextAlignmentElement({
  hovered,
  rndActive,
  setDisableRnd,
  alignText,
}) {
  return (
    <div css={[container]}>
      <ElementControls
        show={hovered && !rndActive}
        buttons={[
          {
            type: 'textLeft',
            func: () => alignText('left'),
          },
          {
            type: 'textCenter',
            func: () => alignText('center'),
          },
          {
            type: 'textRight',
            func: () => alignText('right'),
          },
        ]}
        onMouseEnter={() => setDisableRnd(true)}
        onMouseLeave={() => setDisableRnd(false)}
      />
    </div>
  );
}

export default TextAlignmentElement;
