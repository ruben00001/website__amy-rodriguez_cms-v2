/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import React, { Children, cloneElement, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '../../context/DataContext';

const placeholderContainer = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 500,
});

const tooltipContainer = css({
  fontFamily: "'Roboto', sans-serif",
  display: 'display',
  position: 'absolute',
  top: 'calc(100% + 5px)',
  left: '50%',
  whiteSpace: 'nowrap',
  backgroundColor: '#4d4d4d',
  color: 'white',
  textAlign: 'center',
  padding: '7px 10px',
  borderRadius: 3,
  fontSize: 12,
  transition: 'opacity .1s ease-in-out',
  transitionDelay: '.2s',
  fontVariant: 'normal',

  '&::after': {
    // makes the triangle part of the tooltip
    content: '" "',
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginLeft: '-5px',
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: 'transparent transparent #4d4d4d transparent',
  },
});

function Tooltip({ children, message, disable, translate = 0 }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { settingsRoot } = useData();
  const tooltips = useMemo(() => {
    if (!settingsRoot?.data) return true;
    return settingsRoot.data.tooltips;
  }, [settingsRoot.data]);

  return (
    <React.Fragment>
      {Children.map(children, (child) => {
        if (children.length > 1) {
          throw new Error(`Tooltip is currently set up to work with 1 child.`);
        }
        return cloneElement(child, child.props, [
          child.props.children,
          <div
            css={[
              placeholderContainer,
              (disable || !tooltips) && {
                display: 'none',
              },
            ]}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            key={uuidv4()}
          >
            <div
              css={[
                tooltipContainer,
                { transform: `translateX(calc(-50% + ${translate}px))` },
                { '&::after': { transform: `translateX(${-translate}px)` } },
                !showTooltip && {
                  display: 'none',
                },
              ]}
            >
              {message}
            </div>
          </div>,
        ]);
      })}
    </React.Fragment>
  );
}

export default Tooltip;
