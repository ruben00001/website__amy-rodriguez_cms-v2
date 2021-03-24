/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';

import { selectImage } from '../../utils/contentPageUtils';

import ElementControls from '../common/ElementControls';
import ElementLink from '../common/ElementLink';

const container = css({
  zIndex: 100,
  position: 'relative',
  backgroundColor: 'white',
  width: '27vw',
  height: '18vw',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
  marginTop: 30,
});

const imagesContainer = css({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '27vw',
  height: '18vw',
  overflow: 'hidden',
});

export default function PageElement({
  hovered,
  isDragging,
  data,
  index,
  deletePage,
}) {
  const isUnsavedNewPage = data?.new;
  const { imageComponents } = data;

  return (
    <div
      css={[
        container,
        {
          cursor: isDragging ? 'grabbing' : 'grab',
        },
      ]}
    >
      <div css={imagesContainer}>
        {imageComponents.map((imageComponent) => (
          <img
            css={[
              {
                position: 'absolute',
                left: `${imageComponent.positions[0].x}%`,
                top: `${imageComponent.positions[0].y}%`,
                width: `${imageComponent.widths[0].value}%`,
              },
            ]}
            src={selectImage(imageComponent.image.image, 'small')}
            alt=""
            key={imageComponent.id}
          />
        ))}
      </div>
      <ElementControls
        show={hovered && !isDragging}
        buttons={[{ type: 'delete', func: deletePage }]}
      />
      <ElementLink
        show={hovered && !isDragging}
        to={{ name: `page ${index + 1}`, link: `/portfolio/${data.id}` }}
        prevent={{
          condition: isUnsavedNewPage,
          message: 'Save before editing a newly created page.',
        }}
      />
    </div>
  );
}
