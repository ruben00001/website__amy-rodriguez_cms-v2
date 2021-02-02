/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Rnd } from 'react-rnd';

import { selectImage } from '../../utils';
import { button } from '../common/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const controlsContainer = (theme) =>
  css({
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translateY(-100%)',
    display: 'flex',
    background: theme.colors.midgrey,
    opacity: 0.7,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

const productLink = css(button, {
  position: 'absolute',
  bottom: 10,
  right: 10,
  background: 'white',
  padding: '3px 8px',
  transition: 'opacity 0.3s ease-in-out',
});

const hide = css({
  opacity: 0,
});

function RndImage({
  children,
  imgSrc,
  width,
  position,
  setStyleField,
  showImagePopupForProduct,
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
      enableResizing={enableResizeProp}
      disableDragging={controlsHovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img css={{ width: '100%' }} src={imgSrc} alt="" />
      <div
        css={[controlsContainer, (!hovered || rndActive) && hide]}
        onMouseEnter={() => setControlsHovered(true)}
        onMouseLeave={() => setControlsHovered(false)}
      >
        <FontAwesomeIcon
          css={button}
          icon={faImage}
          onClick={showImagePopupForProduct}
        />
      </div>
      <Link
        css={[productLink, (!hovered || rndActive) && hide]}
        to={'/portfolio'}
      >
        Go to product page
      </Link>
      {children}
    </Rnd>
  );
}

export default RndImage;
