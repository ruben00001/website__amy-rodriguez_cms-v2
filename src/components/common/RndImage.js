/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { Rnd } from 'react-rnd';

import ImageControls from '../portfolio/ImageControls';

const errorBorder = (theme) =>
  css({
    border: `2px solid ${theme.colors.red}`,
  });

const info = (theme) =>
  css({
    position: 'absolute',
    bottom: 10,
    left: 5,
    opacity: 0,
    backgroundColor: theme.colors.verylightgrey,
    padding: '4px 12px',
    borderRadius: 2,
    fontSize: 14,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  });

function RndImage({
  imgSrc,
  width,
  position,
  setStyleField,
  order,
  layer,
  numberImageComponents,
  controlsBeingUsed,
  controlsBeingUsedByComponent,
  setHierarchyField,
  deleteImage,
  setControlsBeingUsedOn,
  setControlsBeingUsedOff,
  orderError,
}) {
  const [rndActive, setRndActive] = useState(false); // have rndActive as well as hovered because rnd-component acts unpredictably with mouseEnter and mouseLeave
  const [hovered, setHovered] = useState(false);

  function handleDragStop(_e, d) {
    setRndActive(false);

    const { x, y } = d;
    setStyleField('positions', { x, y });
  }

  function handleResizeStop(_e, _d, ref) {
    setRndActive(false);

    const widthString = ref.style.width.slice(0, -1);
    const width = Number(widthString);
    setStyleField('widths', width);
  }

  const enableResizeProp = {
    right: true,
    bottom: true,
    bottomRight: true,
  };

  return (
    <Rnd
      size={{ width: `${width}%` }}
      position={{
        x: position.x,
        y: position.y,
      }}
      style={{
        zIndex: hovered || rndActive ? 100 : numberImageComponents - layer,
      }}
      onDragStart={() => setRndActive(true)}
      onDragStop={handleDragStop}
      onResizeStart={() => setRndActive(true)}
      onResizeStop={handleResizeStop}
      lockAspectRatio={true}
      enableResizing={enableResizeProp}
      disableDragging={Boolean(controlsBeingUsed)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        css={[{ width: '100%' }, orderError && errorBorder]}
        src={imgSrc}
        alt=""
      />
      <ImageControls
        show={Boolean(hovered && !rndActive)} // Boolean necessary?
        order={order}
        layer={layer}
        numberImageComponents={numberImageComponents}
        setHierarchyField={setHierarchyField}
        deleteImage={deleteImage}
        setControlsBeingUsedOn={setControlsBeingUsedOn}
        setControlsBeingUsedOff={setControlsBeingUsedOff}
        orderError={orderError}
      />
      <div
        css={[
          info,
          controlsBeingUsed &&
            !controlsBeingUsedByComponent && { opacity: 0.8 },
        ]}
      >
        <p>Order: {order}</p>
        <p>Layer: {layer}</p>
      </div>
    </Rnd>
  );
}

export default RndImage;
