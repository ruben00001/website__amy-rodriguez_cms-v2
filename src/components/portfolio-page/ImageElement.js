/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import ElementControls from '../common/ElementControls';
import Guidelines from '../common/Guidelines';

const container = css({
  position: 'relative',
  display: 'flex',
});

const imgStyle = css({
  width: '100%',
});

const errorStyle = (theme) =>
  css({
    border: `2px solid ${theme.colors.red}`,
  });

function ImageElement({
  hovered,
  rndActive,
  position,
  src,
  canvasWidth,
  canvasHeight,
  numberComponents,
  order,
  layer,
  updateOrder,
  updateLayer,
  deleteElement,
  controlUsed,
  setControlUsed,
  error,
}) {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div css={[container, error && errorStyle]}>
      <img css={imgStyle} src={src} alt="" />
      <ElementControls
        show={(hovered && !rndActive) || controlUsed}
        numberComponents={numberComponents}
        selects={[
          {
            type: 'order',
            value: order,
            func: updateOrder,
          },
          {
            type: 'layer',
            value: layer,
            func: updateLayer,
          },
        ]}
        buttons={[
          {
            type: 'guidelines',
            func: () => setShowGuidelines((guidelines) => !guidelines),
          },
          {
            type: 'delete',
            func: deleteElement,
          },
        ]}
        onMouseEnter={() => setControlUsed(true)}
        onMouseLeave={() => setControlUsed(false)}
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

export default ImageElement;
