/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { selectImage } from '../../utils';
import ElementControls from './ElementControls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const pressElement = css({
  position: 'relative',
  marginBottom: 20,
  cursor: 'grab',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const newElement = (theme) =>
  css({
    border: `1px solid ${theme.colors.midgrey}`,
  });

const elementOverlay = (theme) =>
  css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    opacity: 0.7,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'opacity 0.1s ease-in-out',
    fontFamily: theme.fonts.site,
  });

const visitLinkText = css({
  position: 'absolute',
  right: 0,
  bottom: 0,
  transform: 'translateY(100%)',
  fontSize: 12,
  color: 'black',
  paddingTop: 2,
  textAlign: 'right',
});

function PressElement({
  element,
  canvasWidth,
  editElementText,
  editElementImage,
  deleteElement,
}) {
  const [hovered, setHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const sortableStyle = css({
    transform: CSS.Transform.toString(transform),
    transition,
  });

  return (
    <div
      css={[
        pressElement,
        {
          width: canvasWidth / 6,
          height: canvasWidth / 6,
        },
        sortableStyle,
        isDragging && { zIndex: 100, cursor: 'grabbing' },
        element.new && newElement,
      ]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {element.image && (
        <img src={selectImage(element.image.image, 'small')} alt="" />
      )}
      <div css={[elementOverlay, (!hovered || isDragging) && { opacity: 0 }]}>
        <p>{element.title}</p>
      </div>

      <ElementControls
        show={hovered}
        editElementText={editElementText}
        editElementImage={editElementImage}
        deleteElement={deleteElement}
      />

      {hovered && element.linkUrl && (
        <a
          css={visitLinkText}
          href={element.linkUrl}
          target="_blank"
          rel="noreferrer"
        >
          Visit site
          <FontAwesomeIcon icon={faExternalLinkAlt} css={{ marginLeft: 5 }} />
        </a>
      )}
    </div>
  );
}

export default PressElement;
