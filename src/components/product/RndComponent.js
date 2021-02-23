/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import Guidelines from '../common/Guidelines';

import ImageControls from './ImageControls';
import TextControls from './TextControls';

const textStyle = (theme) =>
  css({
    position: 'relative',
    fontFamily: theme.fonts.site,
  });

const discountStyle = (theme) =>
  css({
    color: theme.colors.midgrey,
    textDecoration: 'line-through',
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

function RndComponent({
  type,
  variant,
  imgSrc,
  text,
  width,
  position,
  layer,
  numberImages,
  setModifiableComponentField,
  updateLayer,
  deleteImage,
  controlsHovered,
  thisComponentControlsHovered,
  setControlsHoveredOn,
  setControlsHoveredOff,
  canvasWidth,
  canvasHeight,
}) {
  const [hovered, setHovered] = useState(false);
  const [rndActive, setRndActive] = useState(false);
  const [textControlsHovered, setTextControlsHovered] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  function handleDragStop(_e, d) {
    setRndActive(false);

    const { x, y } = d;

    setModifiableComponentField('positions', { x, y });
  }

  function handleResizeStop(_e, _d, ref) {
    setRndActive(false);

    const widthString = ref.style.width.slice(0, -1);
    const width = Number(widthString);

    setModifiableComponentField('widths', width);
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
        zIndex: rndActive
          ? 300
          : type === 'text'
          ? 200
          : hovered
          ? 150
          : 100 - layer,
      }}
      onDragStart={() => setRndActive(true)}
      onDragStop={handleDragStop}
      onResizeStart={() => setRndActive(true)}
      onResizeStop={handleResizeStop}
      lockAspectRatio={true}
      enableResizing={type === 'image' ? enableResizeProp : false}
      disableDragging={controlsHovered || textControlsHovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {type === 'image' && (
        <React.Fragment>
          <Guidelines
            parentWidth={canvasWidth}
            parentHeight={canvasHeight}
            elementPosition={position}
            elementType={type}
            show={showGuidelines}
          >
            <img css={{ width: '100%' }} src={imgSrc} alt="" />
          </Guidelines>
          <ImageControls
            show={hovered && !rndActive}
            layer={layer}
            numberImages={numberImages}
            updateLayer={updateLayer}
            deleteImage={deleteImage}
            setControlsHoveredOn={setControlsHoveredOn}
            setControlsHoveredOff={setControlsHoveredOff}
            setShowGuidelines={setShowGuidelines}
          />
          <div
            css={[
              info,
              controlsHovered &&
                !thisComponentControlsHovered && { opacity: 0.8 },
            ]}
          >
            <p>Layer: {layer}</p>
          </div>
        </React.Fragment>
      )}
      {type === 'text' && (
        <React.Fragment>
          <Guidelines
            parentWidth={canvasWidth}
            parentHeight={canvasHeight}
            elementPosition={position}
            elementType={type}
            show={showGuidelines}
          >
            <div css={[textStyle, variant === 'discount' && discountStyle]}>
              {text}
            </div>
          </Guidelines>
          <TextControls
            show={hovered && !rndActive}
            setControlsHovered={setTextControlsHovered}
            setShowGuidelines={setShowGuidelines}
          />
        </React.Fragment>
      )}
    </Rnd>
  );
}

export default RndComponent;
