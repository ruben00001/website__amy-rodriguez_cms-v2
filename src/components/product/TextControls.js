/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faBorderNone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { button } from '../common/styles';

const container = (theme) =>
  css({
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translateY(-100%)',
    display: 'flex',
    background: theme.colors.midgrey,
    opacity: 0.9,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

function TextControls({ show, setControlsHovered, setShowGuidelines }) {
  return (
    <div
      css={[container, !show && { opacity: 0 }]}
      onMouseEnter={() => setControlsHovered(true)}
      onMouseLeave={() => setControlsHovered(false)}
    >
      <FontAwesomeIcon
        css={button}
        icon={faBorderNone}
        onClick={() => setShowGuidelines((guidelines) => !guidelines)}
      />
    </div>
  );
}

export default TextControls;
