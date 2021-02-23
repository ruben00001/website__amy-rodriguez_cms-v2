/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useLayoutEffect, useMemo, useState } from 'react';

import ControlPanel from '../components/common/ControlPanel';
// import InitialLoadingDataOverlay from '../components/common/InitialLoadingDataOverlay';
import RndImage from '../components/shop/RndImage';
import RouterPrompt from '../components/common/RouterPrompt';
import { devices } from '../constants';

import { useData } from '../context/DataContext';
import {
  calcPercentageValue,
  confirmWrapper,
  convertValueToPercent,
  createDefaultImageComponent,
  processShopProducts,
  selectImage,
  selectStyleDataForDevice,
} from '../utils';
import RndPage from '../components/shop/RndPage';
import { useRef } from 'react';
import useCanvasSize from '../hooks/useCanvasSize';
import AddImagePopup from '../components/shop/AddImagePopup';

import ApiRequestOverlay from '../components/common/ApiRequestOverlay';
import { button } from '../components/common/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import useSaveShop from '../hooks/useSaveShop';
import { useEffect } from 'react';

const container = (theme) =>
  css({
    position: 'relative',
    minHeight: '100vh',
    overflowX: 'hidden',
    backgroundColor: theme.colors.verylightgrey,
  });

const body = (theme) =>
  css({
    position: 'absolute',
    backgroundColor: theme.colors.verylightgrey,
    left: 0,
    width: '100%',
  });

const scrollButton = css(button, {
  zIndex: 200,
  position: 'fixed',
  left: 5,
  display: 'flex',
  alignItems: 'center',
  color: 'black',
  border: '1px solid black',

  borderRadius: 2,
  fontSize: 11,
  fontWeight: 'bold',

  p: {
    marginLeft: 4,
  },
});

const scrollIcon = css({
  fontSize: 11,
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
  - new product: create zone above canvas for new products. either post new strapiProduct or use placeholder.
  - should maybe disable dragging of images when dragging page
  - z index for shop images?
  - ability to zoom out
  - why did new product create multiple versions of itself?
*/

function Shop() {
  // const [productsModified, setProductsModified] = useState(null);
  // const [shopPageHeightsModified, setShopPageHeightsModified] = useState(null);
  // const [deviceNum, setDeviceNum] = useState(0);
  // const device = useMemo(() => devices[deviceNum], [deviceNum]);
  // const [unsavedChange, setUnsavedChange] = useState(false);
  // const [addImagePopUp, setAddImagePopUp] = useState({
  //   show: false,
  //   product: null,
  // });

  // useEffect(() => {
  //   if (productsModified) console.log('productsModified:', productsModified);
  // }, [productsModified]);

  // // SET UP INITIAL MODIFIABLE DATA

  // const {
  //   status: rootDataFetchStatus,
  //   shopifyProducts: shopifyProductsRoot,
  //   strapiProducts: strapiProductsRoot,
  //   shopHeight: shopPageHeightsRoot,
  // } = useData();
  // const productsRootProcessed = useMemo(
  //   () =>
  //     shopifyProductsRoot && strapiProductsRoot
  //       ? processShopProducts(shopifyProductsRoot, strapiProductsRoot)
  //       : null,

  //   [shopifyProductsRoot, strapiProductsRoot]
  // );

  // useLayoutEffect(() => {
  //   if (productsRootProcessed) {
  //     setProductsModified(productsRootProcessed);
  //   }
  // }, [productsRootProcessed]);

  // useLayoutEffect(() => {
  //   if (shopPageHeightsRoot) {
  //     setShopPageHeightsModified(shopPageHeightsRoot);
  //   }
  // }, [shopPageHeightsRoot]);

  // // SET UP CANVAS

  // const controlPanelRef = useRef(null);
  // const {
  //   width: singleShopPageWidth,
  //   height: singleShopPageHeight,
  // } = useCanvasSize({
  //   parentWidth: document.body.clientWidth,
  //   parentHeight: controlPanelRef.current
  //     ? window.innerHeight - controlPanelRef.current.offsetHeight
  //     : null,
  //   device: devices[deviceNum],
  // });

  // // REFS FOR SCROLLING

  // const topRef = useRef(null);
  // const bottomRef = useRef(null);

  // // ASYNC HOOKS

  // const { status: saveStatus, save: runSave } = useSaveShop(setUnsavedChange);

  // // HELPER FUNCTIONS

  // function selectHeightComponentForDeviceAndCalcTotalPageHeight() {
  //   const deviceShopHeightMultiplier =
  //     selectStyleDataForDevice(shopPageHeightsModified, device)?.value || 1;

  //   return singleShopPageHeight * deviceShopHeightMultiplier;
  // }

  // function selectStyleComponentAndCalcValue(product, styleField) {
  //   const components = product[styleField];
  //   const component = selectStyleDataForDevice(components, device);
  //   if (styleField === 'positions') {
  //     return {
  //       x: calcPercentageValue(component.x, singleShopPageWidth),
  //       y: calcPercentageValue(component.y, singleShopPageHeight),
  //     };
  //   }
  //   if (styleField === 'widths') {
  //     return component.value;
  //   }
  // }

  // function selectImageForProduct(images) {
  //   if (!images[0]) {
  //     return null;
  //   }
  //   const mainImage = images.find((image) => image.shopHomeStatus === 'main');
  //   const imageToUseIfAnyImages = mainImage ? mainImage : images[0];

  //   return selectImage(imageToUseIfAnyImages.image.image, 'medium');
  // }

  // // UPDATE MODIFIED DATA

  // function updatePageHeight(updatedHeight) {
  //   const newMultiplier = updatedHeight / singleShopPageHeight;

  //   setShopPageHeightsModified(
  //     produce((draft) => {
  //       const currentHeightComponent = selectStyleDataForDevice(draft, device);

  //       if (device.aspectRatio === currentHeightComponent.aspectRatio) {
  //         currentHeightComponent.value = newMultiplier;
  //         currentHeightComponent.updated = true;
  //       } else {
  //         const newHeightComponent = {
  //           aspectRatio: device.aspectRatio,
  //           value: newMultiplier,
  //           new: true,
  //         };
  //         draft.push(newHeightComponent);
  //       }
  //     })
  //   );

  //   setUnsavedChange(true);
  // }

  // function updateProductStyle(productToUpdate, field, newValue) {
  //   setProductsModified(
  //     produce((draft) => {
  //       const draftProductToUpdate = draft.find(
  //         (draftProduct) => draftProduct.id === productToUpdate.id
  //       );
  //       const components = draftProductToUpdate[field];
  //       const currentComponent = selectStyleDataForDevice(components, device);

  //       if (device.aspectRatio === currentComponent.aspectRatio) {
  //         const componentIndex = components.findIndex(
  //           (value) => value.aspectRatio === currentComponent.aspectRatio
  //         );
  //         components.splice(componentIndex, 1);
  //       }

  //       const newComponent = {
  //         aspectRatio: device.aspectRatio,
  //       };

  //       if (field === 'positions') {
  //         newComponent.x = convertValueToPercent(
  //           newValue.x,
  //           singleShopPageWidth
  //         );
  //         newComponent.y = convertValueToPercent(
  //           newValue.y,
  //           singleShopPageHeight
  //         );
  //       }
  //       if (field === 'widths') {
  //         newComponent.value = newValue;
  //       }

  //       components.push(newComponent);

  //       draftProductToUpdate.updated = true;
  //     })
  //   );

  //   setUnsavedChange(true);
  // }

  // function moveProductToBottom(productToUpdate) {
  //   updateProductStyle(productToUpdate, 'positions', {
  //     x: 0,
  //     y: selectHeightComponentForDeviceAndCalcTotalPageHeight(),
  //   });
  // }
  // function moveProductToTop(productToUpdate) {
  //   updateProductStyle(productToUpdate, 'positions', {
  //     x: 0,
  //     y: -20,
  //   });
  // }

  // function handleNewMainImage(type, payload) {
  //   setProductsModified(
  //     produce((draft) => {
  //       const productToUpdate = addImagePopUp.product;
  //       const draftProductToUpdate = draft.find(
  //         (draftProduct) => draftProduct.id === productToUpdate.id
  //       );
  //       const draftImages = draftProductToUpdate.images;

  //       draftImages.forEach((image) => {
  //         image.shopHomeStatus = 'none';
  //       });

  //       if (type === 'product') {
  //         const newMainImage = draftImages.find(
  //           (image) => image.id === payload
  //         );
  //         newMainImage.shopHomeStatus = 'main';
  //       } else {
  //         const newImageComponent = createDefaultImageComponent({
  //           imageComponents: draftImages,
  //           image: payload,
  //           page: 'shop',
  //         });
  //         draftImages.push(newImageComponent);

  //         draftProductToUpdate.updated = true;
  //       }
  //     })
  //   );

  //   setUnsavedChange(true);
  // }

  // function save() {
  //   runSave(productsModified, shopPageHeightsModified);
  // }

  // function undoAllChanges() {
  //   function payload() {
  //     setProductsModified(productsRootProcessed);
  //     setShopPageHeightsModified(shopPageHeightsRoot);
  //     setUnsavedChange(false);
  //   }
  //   const confirmMessage =
  //     'Any unsaved work will be lost. Are you sure you want to undo all changes?';

  //   confirmWrapper(confirmMessage, payload);
  // }

  return (
    <div css={container}>
      {/* <div ref={topRef} />
      <ApiRequestOverlay status={saveStatus} />
      <ControlPanel
        position="fixed"
        save={save}
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
        addImage={handleNewMainImage}
      />
      {controlPanelRef.current && (
        <div
          css={[
            body,
            {
              top: controlPanelRef.current.offsetHeight,
            },
          ]}
        >
          <div
            css={[
              scrollButton,
              { top: controlPanelRef.current.offsetHeight + 10 },
            ]}
            onClick={() =>
              bottomRef.current.scrollIntoView({ behaviour: 'smooth' })
            }
          >
            <FontAwesomeIcon css={scrollIcon} icon={faArrowDown} />
            <p>bottom</p>
          </div>
          {shopPageHeightsModified &&
            singleShopPageHeight &&
            singleShopPageWidth && (
              <RndPage
                height={selectHeightComponentForDeviceAndCalcTotalPageHeight()}
                width={singleShopPageWidth}
                updatePageHeight={updatePageHeight}
              >
                <div css={[pageFold, { top: singleShopPageHeight }]}>
                  <p>Page fold</p>
                </div>
                {productsModified &&
                  productsModified.map((product) => (
                    <RndImage
                      imgSrc={selectImageForProduct(product.images)}
                      width={selectStyleComponentAndCalcValue(
                        product,
                        'widths'
                      )}
                      position={selectStyleComponentAndCalcValue(
                        product,
                        'positions'
                      )}
                      setStyleField={(field, newValue) =>
                        updateProductStyle(product, field, newValue)
                      }
                      moveToBottom={() => moveProductToBottom(product)}
                      moveToTop={() => moveProductToTop(product)}
                      showImagePopupForProduct={() =>
                        setAddImagePopUp({ show: true, product })
                      }
                      title={product.title}
                      description={product.description}
                      shopifyId={product.shopifyId}
                      readyToBeEdited={() => {
                        if (!selectImageForProduct(product.images)) {
                          return false;
                        }
                        if (
                          product.images.length === 1 &&
                          product.images[0].new
                        ) {
                          return false;
                        }
                        return true;
                      }}
                      key={product.id}
                    >
                      <p css={productPrice}>
                        £{product.price.replace('.00', '')}
                      </p>
                    </RndImage>
                  ))}
              </RndPage>
            )}{' '}
          <div
            css={[
              scrollButton,
              {
                bottom: 10,
              },
            ]}
            onClick={() =>
              topRef.current.scrollIntoView({ behaviour: 'smooth' })
            }
          >
            <FontAwesomeIcon css={scrollIcon} icon={faArrowUp} />
            <p>top</p>
          </div>
          <div css={{ position: 'absolute', bottom: 0 }} ref={bottomRef} />
        </div>
      )}

      <RouterPrompt unsavedChange={unsavedChange} /> */}
    </div>
  );
}

export default Shop;
