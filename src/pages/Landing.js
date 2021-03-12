/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

import Logo from '../components/common/Logo';
import LogoutButton from '../components/common/LogoutButton';

const container = css({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const header = css({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '1vh 1vw',
});

const body = css({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const welcomeText = (theme) =>
  css({
    fontFamily: theme.fonts.title,
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.5,
  });

const linksContainer = css({
  fontSize: 22,
  fontWeight: 300,
  marginTop: 50,
});

const link = css({
  padding: '14px 20px',
  borderRadius: 4,
  color: 'black',
  display: 'flex',
  alignItems: 'center',
});

const shopLink = css({
  marginTop: 15,
});

function Landing() {
  return (
    <div css={container}>
      <div css={header}>
        <Logo />
        <LogoutButton />
      </div>
      <div css={body}>
        <div>
          <p css={welcomeText}>Welcome to your content management system.</p>
          <div css={linksContainer}>
            <Link css={link} to="/portfolio">
              <FontAwesomeIcon
                style={{ fontSize: 5, marginRight: 12 }}
                icon={faCircle}
              />
              Portfolio
            </Link>
            <Link css={[link, shopLink]} to="/shop">
              <FontAwesomeIcon
                style={{ fontSize: 5, marginRight: 12 }}
                icon={faCircle}
              />
              Shop
            </Link>
            <Link css={[link, shopLink]} to="/press">
              <FontAwesomeIcon
                style={{ fontSize: 5, marginRight: 12 }}
                icon={faCircle}
              />
              Press
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
