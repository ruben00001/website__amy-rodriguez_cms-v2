/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
  faArrowDown,
  faArrowUp,
  faBorderNone,
  faEdit,
  faEye,
  faImage,
  faLayerGroup,
  faSortNumericDown,
  faStore,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import Tooltip from './Tooltip';

import { createPlaceholderArray } from '../../utils';

import { button as buttonDefault } from '../common/styles';

const container = (theme) =>
  css({
    zIndex: 100,
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    background: theme.colors.midgrey,
    color: 'white',
    borderRadius: 2.5,
    padding: '2px 8px',
  });

const inputContainer = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  marginRight: 8,
});

const inputStyle = css({ marginLeft: 8, color: 'black' });

const buttonStyle = css(buttonDefault, {
  position: 'relative',
  fontSize: 14,

  '&:hover': { opacity: 1 },
  '&:active': { opacity: 0.8 },
});

const buttonIcons = {
  order: faSortNumericDown,
  layer: faLayerGroup,
  image: faImage,
  text: faEdit,
  delete: faTrashAlt,
  guidelines: faBorderNone,
  moveToBot: faArrowDown,
  moveToTop: faArrowUp,
  shopHomeStatus: faStore,
  textCenter: faAlignCenter,
  textLeft: faAlignLeft,
  textRight: faAlignRight,
  show: faEye,
};

const buttonMessages = {
  shopHomeStatus: 'Use image for shop.',
  order: 'Order image appears when clicking through.',
  layer: 'Control whether image appears above or below others.',
  image: 'Edit image.',
  text: 'Change title or URL.',
  delete: 'Delete.',
  guidelines: 'Guidelines.',
  moveToBot: 'Move to bottom of the page.',
  moveToTop: 'Move to top of the page.',
  textCenter: "Align all text elements' center to this line.",
  textLeft: "Align all text elements' left side to this line.",
  textRight: "Align all text elements' right side to this line.",
  show: 'Hide or show.',
};

function ElementControls({
  show,
  buttons,
  selects,
  checkboxes,
  numberComponents,
  onMouseEnter,
  onMouseLeave,
  transform = 'translateY(-100%)',
}) {
  const [inputActive, setInputActive] = useState(false);

  const placeHolderArray = useMemo(
    () => createPlaceholderArray(numberComponents),
    [numberComponents]
  );

  return (
    <div
      css={[container, { transform }, !show && { zIndex: -1, opacity: 0 }]}
      onMouseEnter={() => {
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        if (onMouseLeave) onMouseLeave();
      }}
    >
      {checkboxes &&
        checkboxes.map((checkbox, i) => (
          <Tooltip message={buttonMessages[checkbox.type]} key={i}>
            <div css={inputContainer} key={i}>
              <FontAwesomeIcon icon={buttonIcons[checkbox.type]} />
              <input
                css={[inputStyle, { cursor: 'pointer' }]}
                type="checkbox"
                checked={checkbox.value === 'main' ? true : false}
                onChange={(e) =>
                  !e.target.checked ? e.preventDefault() : checkbox.func()
                }
              />
            </div>
          </Tooltip>
        ))}
      {selects &&
        numberComponents > 1 &&
        selects.map((select, i) => (
          <Tooltip
            message={buttonMessages[select.type]}
            disable={inputActive}
            key={i}
          >
            <div css={[inputContainer]} key={i}>
              <FontAwesomeIcon icon={buttonIcons[select.type]} />
              <select
                css={[inputStyle]}
                value={select.value}
                onChange={(e) => select.func(Number(e.target.value))}
                onMouseDown={() => setInputActive(true)}
                onClick={() => setInputActive(false)}
              >
                {placeHolderArray.map((_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </Tooltip>
        ))}
      {buttons.map((button, i) => (
        // <div css={{ position: 'relative' }}>
        <Tooltip message={buttonMessages[button.type]} key={i}>
          <div
            css={[buttonStyle, i < buttons.length - 1 && { marginRight: 8 }]}
            onClick={button.func}
          >
            <FontAwesomeIcon icon={buttonIcons[button.type]} />
          </div>
        </Tooltip>
        // </div>
      ))}
    </div>
  );
}

export default ElementControls;
