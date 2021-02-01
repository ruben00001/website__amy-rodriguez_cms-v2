/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { Rnd } from 'react-rnd';

const container = css({
  backgroundColor: 'white',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
  marginBottom: 300,
});

function RndPage({ children, height, width, marginTop, updatePageHeight }) {
  function calcXPosition() {
    return (document.body.clientWidth - width) / 2;
  }

  function handleResizeStop(e, direction, ref, d) {
    const draggedDistance = d.height;
    const newCanvasHeight = height + draggedDistance;
    updatePageHeight(newCanvasHeight);
  }

  return (
    <Rnd
      size={{ width: width, height: height }}
      position={{ x: calcXPosition(), y: marginTop }}
      style={{ position: 'static' }} // Not sure how Rnd CSS works. Could only move with above position props; position static doesn't affect this and is needed so parent container (in Shop.js) increases correspondingly
      css={container}
      enableResizing={{ bottom: true }}
      disableDragging={true}
      onResizeStop={handleResizeStop}
    >
      <div>{children}</div>
    </Rnd>
  );
}

export default RndPage;
