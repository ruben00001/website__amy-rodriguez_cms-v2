/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faGripVertical, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import ElementControls from '../common/ElementControls';

const container = (theme) =>
  css({
    zIndex: 1000,
    position: 'relative',
    display: 'flex',
    height: '100%',
    borderLeft: `1px dashed ${theme.colors.midgrey_7}`,
    // display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.midgrey_5,
  });

const gripIcon = css({
  // position: 'absolute',
  transform: 'translateY(-50%)',
});

const marker = css({
  position: 'absolute',
  // left: '-50%',
  top: 0,
  transform: 'translateY(-100%)',
});

function TextAlignmentElement({
  hovered,
  rndActive,
  setDisableRnd,
  alignText,
}) {
  const [show, setShow] = useState(true);

  return (
    <div css={[container, !show && { borderLeft: 'none' }]}>
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
          {
            type: 'show',
            func: () => setShow((state) => !state),
          },
        ]}
        onMouseEnter={() => setDisableRnd(true)}
        onMouseLeave={() => setDisableRnd(false)}
        transform="translate(50%, -100%)"
      />
      <FontAwesomeIcon
        css={[gripIcon, !show && { opacity: 0 }]}
        icon={faGripVertical}
      />
      <FontAwesomeIcon
        css={[marker, show && { opacity: 0 }]}
        icon={faSortDown}
      />
    </div>
  );
}

export default TextAlignmentElement;
