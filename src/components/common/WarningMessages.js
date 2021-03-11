/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const container = css({
  zIndex: 10,
  position: 'absolute',
  right: 0,
  bottom: -5,
  transform: 'translateY(100%)',
  display: 'flex',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  paddingTop: 10,
  paddingRight: 10,
  fontSize: 13,
});

const message = (theme) =>
  css({
    display: 'flex',
    alignItems: 'center',
    color: theme.colors.red,
    border: `1px solid ${theme.colors.red}`,
    borderRadius: 3,
    backgroundColor: 'white',
    padding: '3px 5px',
    marginLeft: 10,
    marginBottom: 10,

    p: {
      marginLeft: 6,
    },
  });

const messageIcon = css({
  fontSize: 11,
});

function WarningMessages({ errors }) {
  return (
    <div css={container}>
      {errors.order && (
        <div css={message}>
          <FontAwesomeIcon css={messageIcon} icon={faExclamation} />
          <p>Please ensure no duplication of image 'orders'</p>
        </div>
      )}
    </div>
  );
}

export default WarningMessages;
