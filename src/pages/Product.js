/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, {
  useRef,
  useLayoutEffect,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Parser } from 'html-to-react';

import ControlPanel from '../components/common/ControlPanel';
// import InitialLoadingDataOverlay from '../components/common/InitialLoadingDataOverlay';
import { defaultProductMoveableComponentFields, devices } from '../constants';
import { useData } from '../context/DataContext';
import useCanvasSize from '../hooks/useCanvasSize';
import RndComponent from '../components/product/RndComponent';
import {
  calcPercentageValue,
  confirmWrapper,
  convertValueToPercent,
  createDefaultImageComponent,
  selectImage,
  selectStyleDataForDevice,
} from '../utils';
import produce from 'immer';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { button } from '../components/common/styles';
import RouterPrompt from '../components/common/RouterPrompt';
import AddImagePopup from '../components/product/AddImagePopup';
import ApiRequestOverlay from '../components/common/ApiRequestOverlay';
import useSaveProduct from '../hooks/useSaveProduct';

const container = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
});

const body = (theme) =>
  css({
    display: 'flex',
    position: 'relative',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.verylightgrey,
  });

const backButton = css(button, {
  position: 'absolute',
  left: 20,
  top: 8,
  display: 'flex',
  alignItems: 'center',
  color: 'black',
  border: '1px solid black',
  // backgroundColor: 'white',
  borderRadius: 2,
  fontSize: 11,
  fontWeight: 'bold',

  p: {
    marginLeft: 4,
  },
});

const backIcon = css({
  fontSize: 11,
});

const canvas = css({
  position: 'relative',
  backgroundColor: 'white',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
});

function Product({ shopifyData }) {
  // const [dataModified, setDataModified] = useState(null);
  // const [deviceNum, setDeviceNum] = useState(0);
  // const [unsavedChange, setUnsavedChange] = useState(false);
  // const [showAddImagePopup, setShowAddImagePopup] = useState(false);
  // const [imageControlsHovered, setImageControlsHovered] = useState(false);
  // const device = useMemo(() => devices[deviceNum], [deviceNum]);

  // // SET UP DATA

  // const {
  //   status: rootDataFetchStatus,
  //   strapiProducts: strapiProductsRoot,
  // } = useData();
  // const productDataProcessed = useMemo(() => {
  //   if (strapiProductsRoot && shopifyData) {
  //     const strapiProduct = strapiProductsRoot.find(
  //       (strapiProduct) => strapiProduct.shopifyId === shopifyData.id
  //     );
  //     const strapiProductProcessed = produce(strapiProduct, (draft) => {
  //       for (const [key, value] of Object.entries(draft)) {
  //         if (value === null) {
  //           draft[key] = defaultProductMoveableComponentFields[key];
  //         }
  //       }
  //     });

  //     return strapiProductProcessed;
  //   } else {
  //     return null;
  //   }
  // }, [shopifyData, strapiProductsRoot]);

  // // CANVAS

  // const bodyRef = useRef(null);
  // const { width: canvasWidth, height: canvasHeight } = useCanvasSize({
  //   parentWidth: bodyRef.current?.offsetWidth,
  //   parentHeight: bodyRef.current?.offsetHeight,
  //   device,
  // });

  // // HOOKS

  // const { goBack } = useHistory();
  // const { save, status: saveStatus } = useSaveProduct(setUnsavedChange);

  // useEffect(() => {
  //   if (dataModified) {
  //     console.log('dataModified:', dataModified);
  //   }
  // }, [dataModified, shopifyData]);

  // useLayoutEffect(() => {
  //   if (productDataProcessed) {
  //     setDataModified(productDataProcessed);
  //   }
  // }, [productDataProcessed]);

  // // HELPERS

  // function selectStyleComponentAndCalcValue(styleType, components) {
  //   const component = selectStyleDataForDevice(components, device);
  //   if (styleType === 'position') {
  //     return {
  //       x: calcPercentageValue(component.x, canvasWidth),
  //       y: calcPercentageValue(component.y, canvasHeight),
  //     };
  //   }
  //   if (styleType === 'width') {
  //     return component.value;
  //   }
  // }

  // function htmlToJsx(html) {
  //   const parser = new Parser();
  //   return parser.parse(html);
  // }

  // // UPDATE MODIFIABLE COMPONENTS

  // function setModifiableComponentField({
  //   type,
  //   imageToUpdateId,
  //   field,
  //   newValue,
  // }) {
  //   setDataModified(
  //     produce((draft) => {
  //       let modifiableComponent;

  //       if (type === 'images') {
  //         modifiableComponent = draft.images.find(
  //           (image) => image.id === imageToUpdateId
  //         );
  //       } else {
  //         modifiableComponent = draft[type];
  //       }

  //       const componentFieldValues = modifiableComponent[field];
  //       const currentComponent = selectStyleDataForDevice(
  //         componentFieldValues,
  //         device
  //       );

  //       if (device.aspectRatio === currentComponent.aspectRatio) {
  //         const currentComponentIndex = componentFieldValues.findIndex(
  //           (component) => component.aspectRatio === device.aspectRatio
  //         );
  //         componentFieldValues.splice(currentComponentIndex, 1);
  //       }

  //       const newComponent = {
  //         aspectRatio: device.aspectRatio,
  //       };

  //       if (field === 'positions') {
  //         newComponent.x = convertValueToPercent(newValue.x, canvasWidth);
  //         newComponent.y = convertValueToPercent(newValue.y, canvasHeight);
  //       }
  //       if (field === 'widths') {
  //         newComponent.value = newValue;
  //       }

  //       componentFieldValues.push(newComponent);
  //     })
  //   );
  //   setUnsavedChange(true);
  // }

  // function updateImageLayer(imageToUpdateId, newValue) {
  //   setDataModified(
  //     produce((draft) => {
  //       const draftImages = draft.images;
  //       const imageToUpdate = draftImages.find(
  //         (image) => image.id === imageToUpdateId
  //       );
  //       imageToUpdate.layer = newValue;
  //     })
  //   );
  //   setUnsavedChange(true);
  // }

  // function addImage(image) {
  //   setDataModified(
  //     produce((draft) => {
  //       const draftImages = draft.images;
  //       const newComponent = createDefaultImageComponent({
  //         imageComponents: draftImages,
  //         image,
  //         device,
  //         page: 'product',
  //       });
  //       draft.images = [...draftImages, newComponent];
  //     })
  //   );
  //   setUnsavedChange(true);
  // }

  // function deleteImage(imageToDeleteId) {
  //   function payload() {
  //     setDataModified(
  //       produce((draft) => {
  //         const draftImages = draft.images;
  //         const imageToDeleteIndex = draftImages.findIndex(
  //           (image) => image.id === imageToDeleteId
  //         );
  //         draftImages.splice(imageToDeleteIndex, 1);
  //       })
  //     );
  //     setUnsavedChange(true);
  //   }

  //   const confirmMessage = 'Are you sure you want to delete this image?';

  //   confirmWrapper(confirmMessage, payload);
  // }

  // function undoAllChanges() {
  //   function payload() {
  //     setDataModified(productDataProcessed);
  //     setUnsavedChange(false);
  //   }

  //   const confirmMessage =
  //     'Any unsaved work will be lost. Are you sure you want to undo all changes?';

  //   confirmWrapper(confirmMessage, payload);
  // }

  return (
    <div css={container}>
      {/* <ApiRequestOverlay status={saveStatus} />
      <ControlPanel
        position="static"
        addImage={() => setShowAddImagePopup(true)}
        setDevice={setDeviceNum}
        save={() => save(dataModified)}
        unsavedChange={unsavedChange}
        undoAllChanges={undoAllChanges}
      />
      <AddImagePopup
        show={showAddImagePopup}
        close={() => setShowAddImagePopup(false)}
        addImage={addImage}
      />
      <div css={body} ref={bodyRef}>
        <div css={backButton} onClick={() => goBack()}>
          <FontAwesomeIcon css={backIcon} icon={faArrowLeft} />
          <p>BACK</p>
        </div>
        {canvasWidth && canvasHeight && (
          <div
            css={[
              canvas,
              {
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
              },
            ]}
          >
            {dataModified && (
              <React.Fragment>
                {dataModified.images.map((imageComponent) => (
                  <RndComponent
                    type="image"
                    imgSrc={selectImage(imageComponent.image.image, 'medium')}
                    width={selectStyleComponentAndCalcValue(
                      'width',
                      imageComponent.widths
                    )}
                    position={selectStyleComponentAndCalcValue(
                      'position',
                      imageComponent.positions
                    )}
                    layer={imageComponent.layer}
                    numberImages={dataModified.images.length}
                    setModifiableComponentField={(field, newValue) =>
                      setModifiableComponentField({
                        type: 'images',
                        imageToUpdateId: imageComponent.id,
                        field,
                        newValue,
                      })
                    }
                    updateLayer={(newValue) =>
                      updateImageLayer(imageComponent.id, newValue)
                    }
                    deleteImage={() => deleteImage(imageComponent.id)}
                    controlsHovered={Boolean(imageControlsHovered)}
                    thisComponentControlsHovered={
                      imageControlsHovered === imageComponent.id
                    }
                    setControlsHoveredOn={() =>
                      setImageControlsHovered(imageComponent.id)
                    }
                    setControlsHoveredOff={() => setImageControlsHovered(null)}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    key={imageComponent.id}
                  />
                ))}
                <RndComponent
                  type="text"
                  text="Add To Cart"
                  position={selectStyleComponentAndCalcValue(
                    'position',
                    dataModified.addToCartButton.positions
                  )}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  setModifiableComponentField={(field, newValue) =>
                    setModifiableComponentField({
                      type: 'addToCartButton',
                      field,
                      newValue,
                    })
                  }
                />
                <RndComponent
                  type="text"
                  variant="discount"
                  text="£100"
                  position={selectStyleComponentAndCalcValue(
                    'position',
                    dataModified.productDiscount.positions
                  )}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  setModifiableComponentField={(field, newValue) =>
                    setModifiableComponentField({
                      type: 'productDiscount',
                      field,
                      newValue,
                    })
                  }
                />
                <RndComponent
                  type="text"
                  text={htmlToJsx(shopifyData.descriptionHtml)}
                  position={selectStyleComponentAndCalcValue(
                    'position',
                    dataModified.productViewDescription.positions
                  )}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  setModifiableComponentField={(field, newValue) =>
                    setModifiableComponentField({
                      type: 'productViewDescription',
                      field,
                      newValue,
                    })
                  }
                />
                <RndComponent
                  type="text"
                  text={`£${shopifyData.variants[0].price.replace('.00', '')}`}
                  position={selectStyleComponentAndCalcValue(
                    'position',
                    dataModified.productViewPrice.positions
                  )}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  setModifiableComponentField={(field, newValue) =>
                    setModifiableComponentField({
                      type: 'productViewPrice',
                      field,
                      newValue,
                    })
                  }
                />
                <RndComponent
                  type="text"
                  text={shopifyData.title}
                  position={selectStyleComponentAndCalcValue(
                    'position',
                    dataModified.productViewTitle.positions
                  )}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  setModifiableComponentField={(field, newValue) =>
                    setModifiableComponentField({
                      type: 'productViewTitle',
                      field,
                      newValue,
                    })
                  }
                />
              </React.Fragment>
            )}
          </div>
        )}
      </div>
      <RouterPrompt unsavedChange={unsavedChange} /> */}
    </div>
  );
}

export default Product;
