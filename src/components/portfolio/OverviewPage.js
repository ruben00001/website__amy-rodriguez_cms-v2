/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { selectImage } from '../../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { button } from '../common/styles';

const container = css({
  position: 'relative',
  backgroundColor: 'white',
  width: '27vw',
  height: '18vw',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
  marginTop: 30,
});

const controls = (theme) =>
  css({
    zIndex: 20,
    position: 'absolute',
    top: 10,
    right: 10,
    background: theme.colors.midgrey,
    borderRadius: 2,
    color: 'white',
    padding: '2px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 14,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
  });

// const grabCursor = css({
//   cursor:
// });

// const deleteIcon = css(button, {

// });

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

export default function OverviewPage({ data, deletePage }) {
  const [hovered, setHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: data.id });
  const isUnsavedNewPage = data?.new;

  const { imageComponents } = data;

  const style = css({
    transform: CSS.Transform.toString(transform),
    transition,
  });

  return (
    <div
      ref={setNodeRef}
      css={[style, { zIndex: hovered ? 99 : 1 }]}
      {...listeners}
      {...attributes}
    >
      <div
        css={[
          container,
          {
            cursor: isDragging ? 'grabbing' : 'grab',
          },
        ]}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
        <div css={[controls, hovered && { opacity: 0.8 }]}>
          <FontAwesomeIcon icon={faTrash} css={button} onClick={deletePage} />
        </div>
        <Link
          css={[link, hovered && { opacity: 1 }]}
          to={`/portfolio/${data.id}`}
          onClick={(e) => {
            if (isUnsavedNewPage) {
              e.preventDefault();
              const message =
                'You must save before editing a newly created page';
              window.alert(message);
            }
          }}
        >
          <FontAwesomeIcon icon={faEdit} />
        </Link>
      </div>
    </div>
  );
}
