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
  createDefaultImageComponent,
  selectStyleDataForDevice,
} from '../utils';
import RndPage from '../components/shop/RndPage';
import { useRef } from 'react';
import useCanvasSize from '../hooks/useCanvasSize';
import AddImagePopup from '../components/shop/AddImagePopup';

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
  - usePostImapUpload (and other hooks?) should be changed so returns new image rather than updating state
  - then apply to addimagepopup
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
  const [addImagePopUp, setAddImagePopUp] = useState({
    show: false,
    product: null,
  });

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
      console.log(
        '🚀 ~ file: Shop.js ~ line 95 ~ productsRootProcessed ~ strapiProductsRoot',
        strapiProductsRoot
      );
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

  function findPositionForDeviceAndCalcValue(product) {
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

        draftProductToUpdate.updated = true;
      })
    );
  }

  function handleNewMainImage(type, payload) {
    setProductsModified(
      produce((draft) => {
        const productToUpdate = addImagePopUp.product;
        const draftProductToUpdate = draft.find(
          (draftProduct) => draftProduct.strapiId === productToUpdate.strapiId
        );
        const draftImages = draftProductToUpdate.images;

        draftImages.forEach((image) => {
          image.shopHomeStatus = 'none';
        });

        if (type === 'product') {
          draftImages.forEach((image) => {
            if (image.id === payload) {
              image.shopHomeStatus = 'main';
            }
          });
        } else {
          const newImageComponent = createDefaultImageComponent({
            imageComponents: draftImages,
            image: payload,
            page: 'shop',
          });
          draftImages.push(newImageComponent);

          draftProductToUpdate.updated = true;
        }
      })
    );

    setUnsavedChange(true);
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
      <AddImagePopup
        show={addImagePopUp.show}
        close={() =>
          setAddImagePopUp((addImagePopUp) => {
            return { ...addImagePopUp, show: false };
          })
        }
        product={addImagePopUp.product}
        handleNewMainImage={handleNewMainImage}
        device={device}
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
                position={findPositionForDeviceAndCalcValue(product)}
                updateWidth={(newValue) =>
                  updateProductStyle(product, 'widths', newValue)
                }
                updatePosition={(newValue) =>
                  updateProductStyle(product, 'positions', newValue)
                }
                showImagePopupForProduct={() =>
                  setAddImagePopUp({ show: true, product })
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
