/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import ElementControls from '../common/ElementControls';
import Guidelines from '../common/Guidelines';

const container = (theme) =>
  css({
    position: 'relative',
    display: 'flex',
    fontFamily: theme.fonts.site,
  });

function TextElement({
  hovered,
  rndActive,
  setDisableRnd,
  position,
  text,
  canvasWidth,
  canvasHeight,
  widthSet,
  setWidth,
}) {
  const [showGuidelines, setShowGuidelines] = useState(false);

  const ref = useRef(null);

  useLayoutEffect(() => {
    if (widthSet || !ref.current) return;
    const width = ref.current.getBoundingClientRect().width;
    setWidth(width);
  }, [ref, setWidth, widthSet]);

  return (
    <div css={[container]} ref={ref}>
      {text}
      <ElementControls
        show={hovered && !rndActive}
        buttons={[
          {
            type: 'guidelines',
            func: () => setShowGuidelines((guidelines) => !guidelines),
          },
        ]}
        onMouseEnter={() => setDisableRnd(true)}
        onMouseLeave={() => setDisableRnd(false)}
      />
      <Guidelines
        show={showGuidelines}
        parentWidth={canvasWidth}
        parentHeight={canvasHeight}
        elementPosition={position}
      />
    </div>
  );
}

export default TextElement;
