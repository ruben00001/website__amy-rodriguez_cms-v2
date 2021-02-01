/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useLayoutEffect } from 'react';
import { useMemo, useState } from 'react';
import ControlPanel from '../components/common/ControlPanel';
import InitialLoadingDataOverlay from '../components/common/InitialLoadingDataOverlay';
import RndImage from '../components/shop/RndImage';
import RouterPrompt from '../components/common/RouterPrompt';
import { devices } from '../constants';

import { useData } from '../context/DataContext';
import {
  calcPercentageValue,
  convertValueToPercent,
  selectStyleDataForDevice,
} from '../utils';
import RndPage from '../components/shop/RndPage';
import { useRef } from 'react';
import useCanvasSize from '../hooks/useCanvasSize';

const container = (theme) =>
  css({
    minHeight: '100vh',
    backgroundColor: theme.colors.verylightgrey,
    overflowX: 'hidden',
    paddingBottom: 300,
  });

const pageFold = css({
  borderTop: '2px dashed #e8e8e8',
  position: 'absolute',
  height: 2,
  width: '100%',

  p: {
    position: 'absolute',
    right: '-5px',
    fontSize: 10,
    transform: 'translate(100%, -50%)',

    color: '#999999',
  },
});

const productPrice = (theme) =>
  css({
    position: 'absolute',
    bottom: 0,
    left: 5,
    transform: 'translateY(100%)',
    fontFamily: theme.fonts.site,
  });

/* NOTES
  - sort out z-index for hover and drag/resize to make images easier to handle
  - auto-update page height if image dropped below page level?
  - should maybe disable dragging of images when dragging page
  - what to do for new products
  - z index for shop images?
  - tooltips would be good on e.g. hover image icon and other pages
*/

function Shop() {
  const [productsModified, setProductsModified] = useState(null);
  const [shopPageHeightsModified, setShopPageHeightsModified] = useState(null);
  const [unsavedChange, setUnsavedChange] = useState(false);

  const [deviceNum, setDeviceNum] = useState(0);
  const device = useMemo(() => devices[deviceNum], [deviceNum]);

  const controlPanelRef = useRef(null);
  const {
    width: singleShopPageWidth,
    height: singleShopPageHeight,
  } = useCanvasSize({
    parentWidth: window.innerWidth,
    parentHeight: controlPanelRef.current
      ? window.innerHeight - controlPanelRef.current.offsetHeight
      : null,
    device: devices[deviceNum],
  });

  // SET UP INITIAL MODIFIABLE DATA

  const {
    shopifyProducts: shopifyProductsRoot,
    strapiProducts: strapiProductsRoot,
    shopHeight: shopPageHeightsRoot,
    status: rootDataFetchStatus,
  } = useData();
  const productsRootProcessed = useMemo(() => {
    if (shopifyProductsRoot && strapiProductsRoot) {
      const mergedProducts = [];
      shopifyProductsRoot.forEach((shopifyProduct) => {
        const { availableForSale, id: shopifyId } = shopifyProduct;
        const price = shopifyProduct.variants[0].price;
        const strapiProduct = strapiProductsRoot.find(
          (strapiProduct) => strapiProduct.shopifyId === shopifyId
        );
        const {
          id: strapiId,
          images,
          shopHomeImgPositions: positions,
          shopHomeImgWidths: widths,
        } = strapiProduct;
        mergedProducts.push({
          strapiId,
          images,
          positions,
          widths,
          availableForSale,
          price,
        });
      });
      return mergedProducts;
    }
    return null;
  }, [shopifyProductsRoot, strapiProductsRoot]);

  useLayoutEffect(() => {
    if (productsRootProcessed) {
      console.log(
        '🚀 ~ file: Shop.js ~ line 108 ~ useLayoutEffect ~ productsRootProcessed',
        productsRootProcessed
      );
      setProductsModified(productsRootProcessed);
    }
  }, [productsRootProcessed]);

  useLayoutEffect(() => {
    if (shopPageHeightsRoot) {
      setShopPageHeightsModified(shopPageHeightsRoot);
    }
  }, [shopPageHeightsRoot]);

  // HELPER FUNCTIONS

  function selectHeightComponentForDeviceAndCalcTotalPageHeight() {
    const deviceShopHeightMultiplier =
      selectStyleDataForDevice(shopPageHeightsModified, device)?.value || 1;
    return singleShopPageHeight * deviceShopHeightMultiplier;
  }

  function findPositionForDeviceAndCalValue(product) {
    const components = product.positions;
    const { x, y } = selectStyleDataForDevice(components, device);

    return {
      x: calcPercentageValue(x, singleShopPageWidth),
      y: calcPercentageValue(y, singleShopPageHeight),
    };
  }

  function findWidthForDevice(product) {
    const components = product.widths;
    const { value } = selectStyleDataForDevice(components, device);

    return value;
  }

  // UPDATE MODIFIED DATA

  function updatePageHeight(updatedHeight) {
    const newMultiplier = updatedHeight / singleShopPageHeight;

    setShopPageHeightsModified(
      produce((draft) => {
        const currentHeightComponent = selectStyleDataForDevice(draft, device);

        if (device.aspectRatio === currentHeightComponent.aspectRatio) {
          currentHeightComponent.value = newMultiplier;
        } else {
          const newHeightComponent = {
            aspectRatio: device.aspectRatio,
            value: newMultiplier,
          };
          draft.push(newHeightComponent);
        }
      })
    );

    setUnsavedChange(true);
  }

  function updateProductStyle(productToUpdate, field, newValue) {
    setProductsModified(
      produce((draft) => {
        const draftProductToUpdate = draft.find(
          (draftProduct) => draftProduct.strapiId === productToUpdate.strapiId
        );
        const components = draftProductToUpdate[field];
        const currentComponent = selectStyleDataForDevice(components, device);

        if (device.aspectRatio === currentComponent.aspectRatio) {
          const componentIndex = components.findIndex(
            (value) => value.aspectRatio === currentComponent.aspectRatio
          );
          components.splice(componentIndex, 1);
        }

        const newComponent = {
          aspectRatio: device.aspectRatio,
        };

        if (field === 'positions') {
          newComponent.x = convertValueToPercent(
            newValue.x,
            singleShopPageWidth
          );
          newComponent.y = convertValueToPercent(
            newValue.y,
            singleShopPageHeight
          );
        }
        if (field === 'widths') {
          newComponent.value = newValue;
        }

        components.push(newComponent);
      })
    );
  }

  function undoAllChanges() {
    const confirmRes = window.confirm(
      'Any unsaved work will be lost. Are you sure you want to undo all changes?'
    );
    if (confirmRes) {
      setProductsModified(productsRootProcessed);
      setShopPageHeightsModified(shopPageHeightsRoot);
      setUnsavedChange(false);
    }
  }

  return (
    <div css={container}>
      {rootDataFetchStatus !== 'complete' && (
        <InitialLoadingDataOverlay status={rootDataFetchStatus} />
      )}
      {/* <ApiRequestOverlay status={saveStatus} /> */}

      <ControlPanel
        position="fixed"
        // save={() => save(portfolioDataModified)}
        setDevice={setDeviceNum}
        unsavedChange={unsavedChange}
        undoAllChanges={undoAllChanges}
        ref={controlPanelRef}
      />
      {shopPageHeightsModified && singleShopPageHeight && singleShopPageWidth && (
        <RndPage
          height={selectHeightComponentForDeviceAndCalcTotalPageHeight()}
          width={singleShopPageWidth}
          marginTop={
            controlPanelRef.current.offsetHeight + singleShopPageHeight * 0.1
          }
          updatePageHeight={updatePageHeight}
        >
          <div css={[pageFold, { top: singleShopPageHeight }]}>
            <p>Page fold</p>
          </div>
          {productsModified &&
            productsModified.map((product) => (
              <RndImage
                image={
                  product.images.find(
                    (image) => image.shopHomeStatus === 'main'
                  )?.image
                }
                width={findWidthForDevice(product)}
                position={findPositionForDeviceAndCalValue(product)}
                updateWidth={(newValue) =>
                  updateProductStyle(product, 'widths', newValue)
                }
                updatePosition={(newValue) =>
                  updateProductStyle(product, 'positions', newValue)
                }
                key={product.strapiId}
              >
                <p css={productPrice}>£{product.price.replace('.00', '')}</p>
              </RndImage>
            ))}
        </RndPage>
      )}

      <RouterPrompt unsavedChange={unsavedChange} />
    </div>
  );
}

export default Shop;
