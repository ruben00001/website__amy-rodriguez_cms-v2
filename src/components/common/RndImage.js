/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useState, useLayoutEffect } from 'react';
import { Rnd } from 'react-rnd';

import {
  selectImage,
  selectStyleDataForDevice,
  calcPercentageValue,
  convertValueToPercent,
} from '../../utils';
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
  data,
  device,
  pageDimensions,
  imageComponentsModified,
  setImageComponentsModified,
  errors,
  controlsBeingUsed,
  setControlsBeingUsed,
  setUnsavedChange,
}) {
  const [{ position, width }, setStyle] = useState({
    position: { x: null, y: null },
    width: null,
  });
  const [rndActive, setRndActive] = useState(false); // have rndActive as well as hovered because rnd-component acts unpredictably with mouseEnter and mouseLeave
  const [hovered, setHovered] = useState(false);

  useLayoutEffect(() => {
    // set inital style for device from stored data
    const { x, y } = selectStyleDataForDevice(data.positions, device);
    const { value: width } = selectStyleDataForDevice(data.widths, device);

    setStyle({
      position: {
        x: calcPercentageValue(x, pageDimensions.width),
        y: calcPercentageValue(y, pageDimensions.height),
      },
      width,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageDimensions]); // pageDimensions is the last thing to be worked out

  function orderError() {
    const componentsWithOrderErrorsIds = errors.order;
    const thisComponentId = data.id;

    return componentsWithOrderErrorsIds.includes(thisComponentId);
  }

  function setImageComponentStyle(componentId, style, value) {
    setImageComponentsModified(
      produce((draft) => {
        const component = draft.find(
          (component) => component.id === componentId
        );
        const styleValues = component[style];
        const currentStyleForDevice = selectStyleDataForDevice(
          styleValues,
          device
        );

        if (device.aspectRatio === currentStyleForDevice.aspectRatio) {
          const styleIndex = styleValues.findIndex(
            (value) => value.aspectRatio === currentStyleForDevice.aspectRatio
          );
          styleValues.splice(styleIndex, 1);
        }

        const newStyleValue = {
          aspectRatio: device.aspectRatio,
        };
        if (style === 'positions') {
          newStyleValue.x = convertValueToPercent(
            value.x,
            pageDimensions.width
          );
          newStyleValue.y = convertValueToPercent(
            value.y,
            pageDimensions.height
          );
        }
        if (style === 'widths') {
          newStyleValue.value = value;
        }

        styleValues.push(newStyleValue);
        styleValues.sort((a, b) => b.aspectRatio - a.aspectRatio);
      })
    );
    setUnsavedChange(true);
  }

  function handleRndStart() {
    setRndActive(true);
  }

  function handleDragStop(d) {
    setRndActive(false);

    const { x, y } = d;
    setStyle((style) => {
      return { ...style, position: { x, y } };
    });
    setImageComponentStyle(data.id, 'positions', { x, y });
  }

  function handleResizeStop(ref) {
    setRndActive(false);

    const widthString = ref.style.width.slice(0, -1);
    const width = Number(widthString);
    setStyle((style) => {
      return { ...style, width };
    });
    setImageComponentStyle(data.id, 'widths', width);
  }

  const enableResizeProp = {
    top: false,
    right: true,
    bottom: true,
    left: false,
    topRight: false,
    bottomRight: true,
    bottomLeft: false,
    topLeft: false,
  };

  return (
    <Rnd
      size={{ width: `${width}%` }}
      position={{
        x: position.x,
        y: position.y,
      }}
      style={{
        zIndex:
          hovered || rndActive
            ? 100
            : imageComponentsModified.length - data.layer,
      }}
      onDragStart={handleRndStart}
      onDragStop={(e, d) => handleDragStop(d)}
      onResizeStart={handleRndStart}
      onResizeStop={(e, direction, ref, delta, position) =>
        handleResizeStop(ref, position)
      }
      lockAspectRatio={true}
      enableResizing={enableResizeProp}
      disableDragging={Boolean(controlsBeingUsed)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ImageControls
        controlsBeingUsed={controlsBeingUsed}
        data={data}
        orderError={orderError}
        imageComponentsModified={imageComponentsModified}
        setImageComponentsModified={setImageComponentsModified}
        setControlsBeingUsed={setControlsBeingUsed}
        show={Boolean(hovered && !rndActive)}
        setUnsavedChange={setUnsavedChange}
      />
      <img
        css={[{ width: '100%' }, orderError() && errorBorder]}
        src={selectImage(data.image.image, 'medium')}
        alt=""
      />
      <div
        css={[
          info,
          controlsBeingUsed &&
            controlsBeingUsed !== data.id && { opacity: 0.8 },
        ]}
      >
        <p>Order: {data.order}</p>
        <p>Layer: {data.layer}</p>
      </div>
    </Rnd>
  );
}

export default RndImage;
