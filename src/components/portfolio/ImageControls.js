/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import {
  faLayerGroup,
  faSortNumericDown,
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
    background: theme.colors.midgrey,
    opacity: 0.7,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

const selectContainer = css({
  display: 'flex',
  alignItems: 'center',
  margin: '0 20px',
});

const selectStyle = css({ marginLeft: 8, color: 'black' });

const errorColor = (theme) =>
  css({
    color: theme.colors.red,
  });

function ImageControls({
  show,
  order,
  layer,
  numberImageComponents,
  setHierarchyField,
  deleteImage,
  setControlsBeingUsedOn,
  setControlsBeingUsedOff,
  orderError,
}) {
  const placeHolderArray = useMemo(
    () => createPlaceholderArray(numberImageComponents),
    [numberImageComponents]
  );

  function createSelect(imageComponentField) {
    return (
      <div
        css={[
          selectContainer,
          imageComponentField === 'order' && orderError && errorColor,
        ]}
      >
        <FontAwesomeIcon
          icon={
            imageComponentField === 'order' ? faSortNumericDown : faLayerGroup
          }
        />
        <select
          css={[
            selectStyle,
            imageComponentField === 'order' && orderError && errorColor,
          ]}
          value={imageComponentField === 'order' ? order : layer}
          onChange={(e) =>
            setHierarchyField(imageComponentField, Number(e.target.value))
          }
        >
          {placeHolderArray.map((_, i) => (
            <option value={i + 1} key={i}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      css={[container, !show && { opacity: 0 }]}
      onMouseEnter={setControlsBeingUsedOn}
      onMouseLeave={setControlsBeingUsedOff}
    >
      {numberImageComponents > 1 && createSelect('order')}
      {numberImageComponents > 1 && createSelect('layer')}
      <FontAwesomeIcon css={button} icon={faTrashAlt} onClick={deleteImage} />
    </div>
  );
}

export default ImageControls;
