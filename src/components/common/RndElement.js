import { Children, cloneElement, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

function RndElement({
  children,
  width,
  widthUnit = '%',
  height,
  position,
  zIndex = 1,
  updatePosition,
  updateWidth,
  updateHeight,
  positionType = 'absolute',
  dragAxis = 'both',
  lockAspectRatio = true,
  disableDragging,
  enableResizing = false,
  cloneProps = true,
}) {
  const [rndActive, setRndActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [livePosition, setLivePosition] = useState(null);
  const [disable, setDisable] = useState(false);

  function handleDragStop(_e, { x, y }) {
    setRndActive(false);

    updatePosition({ x, y });
  }

  function handleResizeStop(_e, _d, ref, d) {
    setRndActive(false);

    if (updateWidth) {
      const widthString = ref.style.width.slice(0, -1);
      const width = Number(widthString);
      updateWidth(width);
    }

    if (updateHeight) {
      const draggedDistance = d.height;
      const newCanvasHeight = height + draggedDistance;
      updateHeight(newCanvasHeight);
    }
  }

  return (
    <Rnd
      size={{
        width: width ? `${width}${widthUnit}` : 'auto',
        height: height ? `${height}px` : 'auto',
      }}
      position={{
        x: position.x,
        y: position.y,
      }}
      style={{
        position: positionType,
        cursor: rndActive ? 'grabbing' : 'grab',
        zIndex: hovered || rndActive ? 100 : zIndex,
      }}
      onDrag={(_, { x, y }) => setLivePosition({ x, y })}
      onDragStart={() => setRndActive(true)}
      onDragStop={handleDragStop}
      onResizeStart={() => setRndActive(true)}
      onResizeStop={handleResizeStop}
      dragAxis={dragAxis}
      lockAspectRatio={lockAspectRatio}
      enableResizing={enableResizing}
      disableDragging={Boolean(disableDragging || disable)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cloneProps
        ? Children.map(children, (child) => {
            if (children.length > 1) {
              throw new Error(
                `RndElement is currently set up to work with 1 child.`
              );
            }
            return cloneElement(child, {
              ...child.props,
              hovered,
              rndActive,
              position: livePosition || position,
              setDisableRnd: setDisable,
            });
          })
        : children}
    </Rnd>
  );
}

export default RndElement;
