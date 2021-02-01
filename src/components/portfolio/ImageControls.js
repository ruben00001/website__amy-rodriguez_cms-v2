/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import {
  faLayerGroup,
  faSortNumericDown,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import produce from 'immer';
import { button } from '../common/styles';

const container = (theme) =>
  css({
    position: 'absolute',
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
  data,
  orderError,
  imageComponentsModified,
  setImageComponentsModified,
  setControlsBeingUsed,
  show,
  setUnsavedChange,
}) {
  function setImageComponentHierarchyProp(componentId, prop, newValue) {
    setImageComponentsModified(
      produce((draft) => {
        const component = draft.find(
          (component) => component.id === componentId
        );
        component[prop] = newValue;
      })
    );
    setUnsavedChange(true);
  }

  function handleDelete(componentToDeleteId) {
    const confirmRes = window.confirm(
      'Are you sure you want to delete this image?'
    );
    if (confirmRes) {
      setImageComponentsModified(
        produce((draft) => {
          const deleteIndex = draft.findIndex(
            (component) => component.id === componentToDeleteId
          );
          draft.splice(deleteIndex, 1);
          draft.sort((a, b) => a.order - b.order);
          draft.forEach((component, i) => {
            component.order = i + 1;

            if (component.layer > draft.length) {
              component.layer = draft.length;
            }
          });
        })
      );
    }
    setControlsBeingUsed(null); // component removed without reset leads to other image components not being usable
    setUnsavedChange(true);
  }

  function createSelect(imageComponentProp) {
    return (
      <div
        css={[
          selectContainer,
          imageComponentProp === 'order' && orderError() && errorColor,
        ]}
      >
        <FontAwesomeIcon
          icon={
            imageComponentProp === 'order' ? faSortNumericDown : faLayerGroup
          }
        />
        <select
          css={[
            selectStyle,
            imageComponentProp === 'order' && orderError() && errorColor,
          ]}
          value={data[imageComponentProp]}
          onChange={(e) =>
            setImageComponentHierarchyProp(
              data.id,
              imageComponentProp,
              Number(e.target.value)
            )
          }
        >
          {imageComponentsModified.map((_, i) => (
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
      onMouseEnter={() => setControlsBeingUsed(data.id)}
      onMouseLeave={() => setControlsBeingUsed(null)}
    >
      {imageComponentsModified.length > 1 && createSelect('order')}
      {imageComponentsModified.length > 1 && createSelect('layer')}
      <FontAwesomeIcon
        css={button}
        icon={faTrashAlt}
        onClick={() => handleDelete(data.id)}
      />
    </div>
  );
}

export default ImageControls;
