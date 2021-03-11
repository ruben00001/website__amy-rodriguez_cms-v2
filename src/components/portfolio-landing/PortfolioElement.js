/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { selectImage } from '../../utils/contentPageUtils';

import ElementControls from '../common/ElementControls';

const container = css({
  zIndex: 100,
  position: 'relative',
  backgroundColor: 'white',
  width: '27vw',
  height: '18vw',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
  marginTop: 30,
});

const link = (theme) =>
  css({
    zIndex: 20,
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: 'white',
    color: theme.colors.midgrey,
  });

export default function PortfolioElement({
  data,
  deletePage,
  hovered,
  isDragging,
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
      <ElementControls
        show={hovered && !isDragging}
        buttons={[{ type: 'delete', func: deletePage }]}
      />
      <Link
        css={[link, hovered && !isDragging && { opacity: 1 }]}
        to={`/portfolio/${data.id}`}
        onClick={(e) => {
          if (isUnsavedNewPage) {
            e.preventDefault();
            const message = 'You must save before editing a newly created page';
            window.alert(message);
          }
        }}
      >
        <FontAwesomeIcon icon={faEdit} />
      </Link>
    </div>
  );
}
