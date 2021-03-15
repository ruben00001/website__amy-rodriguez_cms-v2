/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { button as buttonDefault } from '../common/styles';
import Tooltip from './Tooltip';

const container = (theme) =>
  css({
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: 'translateY(100%)',
    display: 'flex',
    alignItems: 'center',
    background: theme.colors.midgrey_7,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

const linkStyle = (theme) =>
  css(buttonDefault, {
    position: 'relative',
    fontSize: 14,
    color: theme.colors.purple,
  });

function ElementLink({ show, to, prevent, onMouseEnter, onMouseLeave }) {
  return (
    <div
      css={[container, !show && { opacity: 0 }]}
      onMouseEnter={() => {
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        if (onMouseLeave) onMouseLeave();
      }}
    >
      <Tooltip message={`Go to ${to.name}.`}>
        <Link
          css={linkStyle}
          to={to.link}
          onClick={(e) => {
            if (prevent.condition) {
              e.preventDefault();
              window.alert(prevent.message);
            }
          }}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </Tooltip>
    </div>
  );
}

export default ElementLink;
