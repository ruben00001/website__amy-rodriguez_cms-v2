/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { selectImage } from '../../utils/contentPageUtils';

import ElementControls from '../common/ElementControls';

const pressElement = css({
  position: 'relative',

  '::before': {
    content: '" "',
    display: 'block',
    width: '100%',
    height: 0,
    paddingTop: '100%',
  },
});

const imgStyle = css({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const emptyStyle = (theme) =>
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
  backgroundColor: 'white',
  borderRadius: 2,
  zIndex: 100,
});

function PressElement({
  element,
  editElementText,
  editElementImage,
  deleteElement,
  hovered,
  isDragging,
}) {
  const empty = !element.title && !element.image;
  return (
    <div css={[pressElement, empty && emptyStyle]}>
      {element.image && (
        <img
          css={imgStyle}
          src={selectImage(element.image.image, 'small')}
          alt=""
        />
      )}
      <div css={[elementOverlay, !hovered && element.image && { opacity: 0 }]}>
        <p>{element.title}</p>
      </div>
      <ElementControls
        show={hovered && !isDragging}
        buttons={[
          { type: 'image', func: editElementImage },
          { type: 'text', func: editElementText },
          { type: 'delete', func: deleteElement },
        ]}
      />
      {element?.linkUrl && (
        <a
          css={[
            visitLinkText,
            (!hovered || isDragging) && { zIndex: -1, opacity: 0 },
          ]}
          href={element.linkUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            console.log('hello');
          }}
        >
          Visit site
          <FontAwesomeIcon icon={faExternalLinkAlt} css={{ marginLeft: 5 }} />
        </a>
      )}
    </div>
  );
}

export default PressElement;
