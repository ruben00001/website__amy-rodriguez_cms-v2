/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OutsideClickHandler from 'react-outside-click-handler';

import { transitionDurationAndTiming } from './styles';

const container = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const input = css({
  position: 'relative',
  width: 336,
  height: 28,
  padding: '12px 14px',
  boxSizing: 'content-box',
  fontFamily: 'inherit',
  borderRadius: 4,
  transition: 'border 0.1s ease-in-out',
});

const defaultBorder = (theme) =>
  css({
    border: `1px solid ${theme.colors.lightgrey}`,

    '&:focus': {
      border: `1.5px solid ${theme.input.focus}`,
    },
  });

const pendingBorder = (theme) =>
  css({
    border: `1px solid ${theme.input.pending}`,

    '&:focus': {
      border: `1.5px solid ${theme.input.pending}`,
    },
  });

const resolvedBorder = (theme) =>
  css({
    border: `1px solid ${theme.input.resolved}`,

    '&:focus': {
      border: `1.5px solid ${theme.input.resolved}`,
    },
  });

const rejectedBorder = (theme) =>
  css({
    border: `1px solid ${theme.input.rejected}`,

    '&:focus': {
      border: `1.5px solid ${theme.input.rejected}`,
    },
  });

const password = css({
  marginTop: 20,
});

const label = (theme) =>
  css({
    position: 'absolute',
    fontSize: 12,
    top: 0,
    left: 5,
    transform: 'translateY(-50%)',
    backgroundColor: 'white',
    padding: 4,
    color: theme.colors.midgrey,
    borderRadius: 2,
    transition: `color ${transitionDurationAndTiming}`,
  });

const labelFocus = (theme) =>
  css({
    color: theme.input.focus,
  });

const eyeIcon = css({
  position: 'absolute',
  right: 7,
  fontSize: 12,
  cursor: 'pointer',
});

function Input({ type, loginStatus }) {
  const [focus, setFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <OutsideClickHandler onOutsideClick={() => setFocus(false)}>
      <div css={[container, type === 'password' && password]}>
        <input
          css={[
            input,
            !loginStatus && defaultBorder,
            loginStatus === 'pending' && pendingBorder,
            loginStatus === 'resolved' && resolvedBorder,
            loginStatus === 'rejected' && rejectedBorder,
          ]}
          type={type !== 'password' ? type : !showPassword ? type : 'text'}
          name={type}
          id={type}
          onFocus={() => setFocus(true)}
        />
        <label css={[label, focus && labelFocus]} htmlFor={type}>
          {type}
        </label>
        {type === 'password' && (
          <FontAwesomeIcon
            css={eyeIcon}
            onClick={() => setShowPassword((state) => !state)}
            icon={showPassword ? faEye : faEyeSlash}
          />
        )}
      </div>
    </OutsideClickHandler>
  );
}

export default Input;
