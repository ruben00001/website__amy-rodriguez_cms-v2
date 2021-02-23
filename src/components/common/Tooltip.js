/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { useState } from 'react';
import { useData } from '../../context/DataContext';

const container = css({
  position: 'relative',
});

const tooltipContainer = css({
  zIndex: 500,
  position: 'absolute',
  top: 'calc(100% + 5px)',
  left: '50%',
  opacity: 0,
  whiteSpace: 'nowrap',
  backgroundColor: 'black',
  color: '#fff',
  textAlign: 'center',
  padding: '7px 10px',
  borderRadius: 3,
  fontSize: 13,
  transition: 'opacity .1s ease-in-out',
  transitionDelay: '.2s',

  '&::after': {
    // makes the triangle part of the tooltip
    content: '" "',
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginLeft: '-5px',
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: 'transparent transparent black transparent',
  },
});

const opacityOn = css({
  opacity: 0.7,
});

function Tooltip({ children, message, disable, translate = 0 }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { settingsRoot = { tooltips: true } } = useData();

  return (
    <div css={container}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {!disable && settingsRoot?.tooltips && (
        <div
          css={[
            tooltipContainer,
            { transform: `translateX(calc(-50% + ${translate}px))` },
            { '&::after': { transform: `translateX(${-translate}px)` } },
            showTooltip && opacityOn,
          ]}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
