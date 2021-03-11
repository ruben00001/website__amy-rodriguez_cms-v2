/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import React from 'react';

const guideLine = css({
  position: 'absolute',
});

const border = '1px dashed';

const horizontal = css({
  height: 1,
  borderTop: border,
  left: 0,
});

const vertical = css({
  width: 1,
  borderRight: border,
  top: 0,
});

const top = css({
  top: 0,
});

const bottom = css({
  bottom: 0,
});

const left = css({
  left: 0,
});

const right = css({
  right: 0,
});

function Guidelines({
  parentWidth,
  parentHeight,
  elementPosition,
  elementType,
  show,
}) {
  function setColor() {
    switch (elementType) {
      case 'productViewTitle':
        return 'red';
      case 'productViewDescription':
        return 'green';
      case 'addToCartButton':
        return 'blue';
      case 'productViewPrice':
        return '#900C3F';
      case 'productDiscount':
        return 'purple';
      default:
        return 'grey';
    }
  }

  return (
    <React.Fragment>
      <div
        css={[
          guideLine,
          horizontal,
          top,
          {
            width: parentWidth,
            transform: `translateX(-${elementPosition.x}px)`,
            borderColor: setColor(),
            opacity: show ? 1 : 0,
          },
        ]}
      />
      <div
        css={[
          guideLine,
          horizontal,
          bottom,
          {
            width: parentWidth,
            transform:
              elementType === 'image'
                ? `translate(-${elementPosition.x}px, -4px)`
                : `translateX(-${elementPosition.x}px)`,
            borderColor: setColor(),
            opacity: show ? 1 : 0,
          },
        ]}
      />
      <div
        css={[
          guideLine,
          vertical,
          left,
          {
            height: parentHeight,
            transform: `translateY(-${elementPosition.y}px)`,
            borderColor: setColor(),
            opacity: show ? 1 : 0,
          },
        ]}
      />
      <div
        css={[
          guideLine,
          vertical,
          right,
          {
            height: parentHeight,
            transform: `translateY(-${elementPosition.y}px)`,
            borderColor: setColor(),
            opacity: show ? 1 : 0,
          },
        ]}
      />
    </React.Fragment>
  );
}

export default Guidelines;
