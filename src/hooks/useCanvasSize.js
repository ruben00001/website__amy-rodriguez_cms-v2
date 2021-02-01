import { useLayoutEffect } from 'react';
import { useState } from 'react';

function useCanvasSize({ parentWidth, parentHeight, device }) {
  const [dimensions, setDimensions] = useState({ width: null, height: null });

  useLayoutEffect(() => {
    if (parentWidth && parentHeight && device) {
      const deviceAspectRatio = device.aspectRatio;
      const canvasPadding = 0.1;
      const canvasDecimal = 1 - canvasPadding;

      const width = parentWidth * canvasDecimal;
      const height = width / deviceAspectRatio;

      const maxHeight = parentHeight * canvasDecimal;
      if (height <= maxHeight) {
        setDimensions({ width, height });
      } else {
        const height = maxHeight;
        const width = height * deviceAspectRatio;

        setDimensions({ width, height });
      }
    }
  }, [parentWidth, parentHeight, device]);

  return dimensions;
}

export default useCanvasSize;
