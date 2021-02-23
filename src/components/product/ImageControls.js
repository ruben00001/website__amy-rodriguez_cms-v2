/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import {
  faBorderNone,
  faLayerGroup,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { createPlaceholderArray } from '../../utils';
import { button } from '../common/styles';

const container = (theme) =>
  css({
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translateY(-100%)',
    display: 'flex',
    alignItems: 'center',
    background: theme.colors.midgrey,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

const iconButton = css(button, {
  marginRight: 8,
});

const selectContainer = css({
  display: 'flex',
  alignItems: 'center',
  margin: '0 20px',
});

const selectStyle = css({ marginLeft: 8, color: 'black' });

function ImageControls({
  show,
  layer,
  numberImages,
  updateLayer,
  deleteImage,
  setControlsHoveredOn,
  setControlsHoveredOff,
  setShowGuidelines,
}) {
  const placeHolderArray = useMemo(() => createPlaceholderArray(numberImages), [
    numberImages,
  ]);

  return (
    <div
      css={[container, !show && { opacity: 0 }]}
      onMouseEnter={setControlsHoveredOn}
      onMouseLeave={setControlsHoveredOff}
    >
      <FontAwesomeIcon
        css={iconButton}
        icon={faBorderNone}
        onClick={() => setShowGuidelines((guidelines) => !guidelines)}
      />
      {numberImages > 1 && (
        <div css={[selectContainer]}>
          <FontAwesomeIcon icon={faLayerGroup} />
          <select
            css={[selectStyle]}
            value={layer}
            onChange={(e) => updateLayer(Number(e.target.value))}
          >
            {placeHolderArray.map((_, i) => (
              <option value={i + 1} key={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
      <FontAwesomeIcon css={button} icon={faTrashAlt} onClick={deleteImage} />
    </div>
  );
}

export default ImageControls;
