/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faEdit, faImage, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
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
    opacity: 0.7,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

function ElementControls({
  show,
  editElementText,
  editElementImage,
  deleteElement,
}) {
  return (
    <div css={[container, !show && { opacity: 0 }]}>
      <FontAwesomeIcon
        css={[button, { marginRight: 8 }]}
        icon={faImage}
        onClick={editElementImage}
      />
      <FontAwesomeIcon
        css={[button, { marginRight: 8 }]}
        icon={faEdit}
        onClick={editElementText}
      />
      <FontAwesomeIcon css={button} icon={faTrashAlt} onClick={deleteElement} />
    </div>
  );
}

export default ElementControls;
