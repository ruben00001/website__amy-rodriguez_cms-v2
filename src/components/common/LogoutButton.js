/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAuth } from '../../context/AuthContext';
import { button } from './styles';

const logoutButton = (theme) =>
  css(button, {
    display: 'flex',
    color: theme.colors.red,

    p: {
      marginRight: 7,
    },
  });

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <div css={[button, logoutButton]} onClick={() => logout()}>
      <p>Logout</p>
      <FontAwesomeIcon icon={faSignOutAlt} />
    </div>
  );
}

export default LogoutButton;
