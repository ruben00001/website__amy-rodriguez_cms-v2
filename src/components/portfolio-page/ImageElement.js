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

const info = (theme) =>
  css({
    position: 'absolute',
    bottom: 10,
    left: 5,
    opacity: 0.8,
    backgroundColor: theme.colors.verylightgrey,
    padding: '4px 12px',
    borderRadius: 2,
    fontSize: 14,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
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
  setControlUsed,
  setControlNotUsed,
  controlUsed,
  controlUsedByThis,
  error,
}) {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div css={[container, error && errorStyle]}>
      <img css={imgStyle} src={src} alt="" />
      <ElementControls
        show={hovered && !rndActive}
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
        onMouseEnter={setControlUsed}
        onMouseLeave={setControlNotUsed}
      />
      <Guidelines
        show={showGuidelines}
        parentWidth={canvasWidth}
        parentHeight={canvasHeight}
        elementPosition={position}
      />
      <div css={[info, (!controlUsed || controlUsedByThis) && { opacity: 0 }]}>
        <p>Order: {order}</p>
        <p>Layer: {layer}</p>
      </div>
    </div>
  );
}

export default ImageElement;
