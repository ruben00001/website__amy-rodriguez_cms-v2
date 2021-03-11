import { useLayoutEffect } from 'react';
import { useState } from 'react';

function usePageDimensions({ controlPanelHeight, device }) {
  const [dimensions, setDimensions] = useState({
    bodyWidth: null,
    singleScreenBodyHeight: null,
    canvasWidth: null,
    singleScreenCanvasHeight: null,
  });

  useLayoutEffect(() => {
    if (controlPanelHeight) {
      const singleScreenBodyHeight =
        document.body.getBoundingClientRect().height - controlPanelHeight;

      setDimensions((dimensions) => {
        return { ...dimensions, singleScreenBodyHeight };
      });
    }
  }, [controlPanelHeight]);

  useLayoutEffect(() => {
    if (dimensions.singleScreenBodyHeight && device) {
      const deviceAspectRatio = device.aspectRatio;
      const canvasPadding = 0.1;
      const canvasDecimal = 1 - canvasPadding;

      const bodyWidth = document.body.getBoundingClientRect().width;
      const canvasWidth = bodyWidth * canvasDecimal;
      const singleScreenCanvasHeight = canvasWidth / deviceAspectRatio;

      const maxHeight = dimensions.singleScreenBodyHeight * canvasDecimal;
      if (singleScreenCanvasHeight <= maxHeight) {
        setDimensions((dimensions) => {
          return {
            ...dimensions,
            canvasWidth,
            singleScreenCanvasHeight,
            bodyWidth,
          };
        });
      } else {
        const singleScreenCanvasHeight = maxHeight;
        const canvasWidth = singleScreenCanvasHeight * deviceAspectRatio;

        setDimensions((dimensions) => {
          return {
            ...dimensions,
            canvasWidth,
            singleScreenCanvasHeight,
            bodyWidth,
          };
        });
      }
    }
  }, [device, dimensions.singleScreenBodyHeight]);

  return dimensions;
}

export default usePageDimensions;
