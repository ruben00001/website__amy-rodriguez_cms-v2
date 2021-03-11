/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContentPage } from '../../context/ContentPageContext';
import useClickOutside from '../../hooks/useClickOutside';
import LogoutButton from './LogoutButton';
import { button } from './styles';

const container = css({
  zIndex: 200,
  position: 'absolute',
  top: 10,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 200,
  paddingBottom: 60,
  backgroundColor: 'white',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.4)',
  transition: 'transform 0.3s ease-in-out',
});

const moveOut = css({
  transform: 'translateX(calc(-100% - 4px))',
});

const header = css({
  alignSelf: 'flex-end',
  marginBottom: 20,
  paddingTop: 10,
  paddingRight: 10,
});

const link = css({
  color: 'black',
  marginBottom: 30,
});

function NavigationMenu({ show, close }) {
  const containerRef = useRef(null);

  const { page } = useContentPage();

  useClickOutside({
    active: show,
    elementRef: containerRef,
    closeElement: close,
  });

  return (
    <div css={[container, !show && moveOut]} ref={containerRef}>
      <div css={header}>
        <FontAwesomeIcon css={button} icon={faTimes} onClick={close} />
      </div>
      <Link css={link} to="/portfolio">
        Portfolio
      </Link>
      <Link css={link} to="/shop">
        Shop
      </Link>
      <Link
        css={link}
        to="/press"
        onClick={(e) => {
          if (page === 'press') e.preventDefault();
        }}
      >
        Press
      </Link>
      <LogoutButton />
    </div>
  );
}

export default NavigationMenu;
