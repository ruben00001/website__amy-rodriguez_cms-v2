/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Rnd } from 'react-rnd';

import { button } from '../common/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleDown,
  faArrowAltCircleUp,
  faExternalLinkAlt,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../common/Tooltip';

const controlsContainer = (theme) =>
  css({
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translateY(-100%)',
    display: 'flex',
    alignItems: 'center',
    background: theme.colors.midgrey,
    // opacity: 0.7,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

const controlIcon = css({
  marginLeft: 8,
});

const productLink = css(button, {
  position: 'absolute',
  bottom: 10,
  right: 10,
  background: 'white',
  padding: '3px 8px',
  transition: 'opacity 0.3s ease-in-out',
  color: 'black',
});

const hide = css({
  opacity: 0,
});

const newProductContainer = (theme) =>
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

const saveMessage = (theme) =>
  css({
    position: 'absolute',
    bottom: 7,
    backgroundColor: theme.colors.midgrey,
    color: 'white',
    fontWeight: 'bold',
    opacity: 0.8,
    padding: '2px 4px',
  });

function RndImage({
  children,
  imgSrc,
  width,
  position,
  setStyleField,
  moveToBottom,
  moveToTop,
  showImagePopupForProduct,
  title,
  description,
  readyToBeEdited,
  shopifyId,
}) {
  const [hovered, setHovered] = useState(false);
  const [rndActive, setRndActive] = useState(false);
  const [controlsHovered, setControlsHovered] = useState(false);

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
        zIndex: hovered || rndActive ? 100 : 0,
      }}
      onDragStart={() => setRndActive(true)}
      onDragStop={handleDragStop}
      onResizeStart={() => setRndActive(true)}
      onResizeStop={handleResizeStop}
      lockAspectRatio={true}
      enableResizing={imgSrc && enableResizeProp}
      disableDragging={controlsHovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!imgSrc ? (
        <div css={newProductContainer}>
          <h3>no images - add image to be able to edit product</h3>
          <p>
            <b>Title:</b> {title}
          </p>
          <p>
            <b>Description:</b> {description}
          </p>
        </div>
      ) : (
        <img css={{ width: '100%' }} src={imgSrc} alt="" />
      )}
      <div
        css={[controlsContainer, (!hovered || rndActive) && hide]}
        onMouseEnter={() => setControlsHovered(true)}
        onMouseLeave={() => setControlsHovered(false)}
      >
        <Tooltip message="Move image to bottom of page">
          <FontAwesomeIcon
            css={[button, controlIcon]}
            icon={faArrowAltCircleDown}
            onClick={moveToBottom}
          />
        </Tooltip>
        <Tooltip message="Move image to top of page">
          <FontAwesomeIcon
            css={[button, controlIcon]}
            icon={faArrowAltCircleUp}
            onClick={moveToTop}
          />
        </Tooltip>
        <FontAwesomeIcon
          css={[button, controlIcon]}
          icon={faImage}
          onClick={showImagePopupForProduct}
        />
      </div>
      {imgSrc && !readyToBeEdited() && (
        <p css={saveMessage}>Save to be able to edit product</p>
      )}
      {readyToBeEdited() && (
        <Link
          css={[productLink, (!hovered || rndActive) && hide]}
          to={shopifyId}
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </Link>
      )}
      {children}
    </Rnd>
  );
}

export default RndImage;
