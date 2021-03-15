/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import ElementControls from '../common/ElementControls';
import ElementLink from '../common/ElementLink';
import Guidelines from '../common/Guidelines';

const container = css({
  position: 'relative',
  display: 'flex',
});

const imgStyle = css({
  width: '100%',
});

const priceStyle = (theme) =>
  css({
    position: 'absolute',
    bottom: 0,
    left: 5,
    transform: 'translateY(100%)',
    fontFamily: theme.fonts.site,
  });

const placeholder = (theme) =>
  css({
    zIndex: 99,
    border: `1px solid ${theme.colors.lightgrey}`,
    backgroundColor: theme.colors.lightlightgrey,
    padding: 20,

    h3: {
      fontSize: 17,
      fontVariant: 'small-caps',
      marginBottom: 20,
    },

    p: {
      marginTop: 10,
      fontSize: 14,
    },
  });

function Product({
  position,
  hovered,
  rndActive,
  setDisableRnd,
  imgSrc,
  title,
  description,
  price,
  shopifyId,
  hasSavedMainImage,
  canvasWidth,
  canvasHeight,
  editElementImage,
  moveToBot,
  moveToTop,
}) {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div css={container}>
      {imgSrc ? (
        <img css={imgStyle} src={imgSrc} alt="" />
      ) : (
        <div css={placeholder}>
          <h3>{title}</h3>
          <p>{description}</p>
          <p css={{ fontStyle: 'italic' }}>
            No image. Add one and save to be able to edit product.
          </p>
        </div>
      )}
      <p css={priceStyle}>£{price.replace('.00', '')}</p>
      <ElementControls
        show={hovered && !rndActive}
        buttons={[
          { type: 'moveToBot', func: moveToBot },
          { type: 'moveToTop', func: moveToTop },
          { type: 'image', func: editElementImage },
          {
            type: 'guidelines',
            func: () => setShowGuidelines((guidelines) => !guidelines),
          },
        ]}
        onMouseEnter={() => setDisableRnd(true)}
        onMouseLeave={() => setDisableRnd(false)}
      />
      <ElementLink
        show={hovered && !rndActive}
        to={{ name: title, link: `/shop/${shopifyId}` }}
        prevent={{
          condition: !hasSavedMainImage,
          message:
            'Product must have an image and be saved before you can edit.',
        }}
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

export default Product;
