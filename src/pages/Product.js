/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import produce from 'immer';
import { Parser } from 'html-to-react';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '../context/DataContext';

import {
  calcPercentageValue,
  convertValueToPercent,
  findElement,
  sortByAscending,
} from '../utils';

import { defaultProductValues } from '../constants';
import {
  ContentPageProvider,
  useContentPage,
} from '../context/ContentPageContext';
import ContentPageWrapper from '../components/common/ContentPageWrapper';
import {
  confirmWrapper,
  createImageComponent,
  deleteElement,
  selectComponent,
  selectImage,
} from '../utils/contentPageUtils';

import { canvasDefault } from '../components/common/styles';
import RndElement from '../components/common/RndElement';
import ImageElement from '../components/product/ImageElement';
import EditImagePopup from '../components/common/EditImagePopup';
import TextElement from '../components/product/TextElement';
import TextAlignmentElement from '../components/product/TextAlignmentElement';

const canvas = css(canvasDefault, {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
});

/* NOTES
  - canvas should be centered vertically
*/

function Content() {
  const [productModified, setProductModified] = useState(null);
  const [showEditImagePopup, setShowEditImagePopup] = useState(false);
  const [textElementWidths, setTextElementWidths] = useState({});
  console.log(
    '🚀 ~ file: Product.js ~ line 55 ~ Content ~ textElementWidths',
    textElementWidths
  );

  // console.log(
  //   '🚀 ~ file: Product.js ~ line 18 ~ Product ~ productModified',
  //   productModified
  // );

  // HOOKS

  const { history } = useHistory();
  const {
    setUnsavedChange,
    device,
    handleSave,
    mapFetches,
    canvasWidth,
    singleScreenBodyHeight,
    singleScreenCanvasHeight,
  } = useContentPage();

  // SET UP DATA

  const { strapiProductsRoot, shopifyProducts } = useData();
  const { pageId } = useParams();
  const productProcessed = useMemo(() => {
    if (!shopifyProducts.data || !strapiProductsRoot.data) return null;

    const shopifyProduct = findElement(pageId, shopifyProducts.data);
    const strapiProduct = findElement(
      pageId,
      strapiProductsRoot.data,
      'shopifyId'
    );

    if (!strapiProduct) {
      history.push('/shop');
      return null;
    }

    const strapiProductProcessed = produce(strapiProduct, (draft) => {
      delete draft.shopHomeImgPositions;
      delete draft.shopHomeImgWidths;

      for (const [key, value] of Object.entries(draft)) {
        if (value === null || (key === 'textAlignmentPosition' && !value[0])) {
          draft[key] = defaultProductValues[key];
        }
      }
    });

    return {
      ...strapiProductProcessed,
      descriptionJsx: htmlToJsx(shopifyProduct.descriptionHtml),
      price: `£${shopifyProduct.variants[0].price.replace('.00', '')}`,
      title: shopifyProduct.title,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, shopifyProducts.data, strapiProductsRoot.data]);

  useLayoutEffect(() => {
    if (productProcessed) setProductModified(productProcessed);
  }, [productProcessed]);

  // HELPERS

  function htmlToJsx(html) {
    const parser = new Parser();
    return parser.parse(html);
  }

  function handleSelectPosition(component) {
    const { x, y } = selectComponent(
      component.positions,
      device,
      'aspectRatio'
    );

    return {
      x: calcPercentageValue(x, canvasWidth),
      y: calcPercentageValue(y, singleScreenCanvasHeight),
    };
  }

  const handleSelectAlignmentPosition = () => {
    const component = selectComponent(
      productModified.textAlignmentPosition,
      device,
      'aspectRatio'
    );

    return {
      x: calcPercentageValue(component.value, canvasWidth),
      y: 0,
    };
  };

  function alignText(alignment) {
    setProductModified(
      produce((draft) => {
        productTextFields.forEach((textElement) => {
          const draftField = draft[textElement.key];
          const positions = draftField.positions;
          const usedComponent = selectComponent(
            positions,
            device,
            'aspectRatio'
          );

          if (alignment === 'left') {
            usedComponent.x = convertValueToPercent(
              textAlignmentPosition.x,
              canvasWidth
            );
          } else if (alignment === 'center') {
            const x =
              textAlignmentPosition.x - textElementWidths[textElement.key] / 2;
            usedComponent.x = convertValueToPercent(x, canvasWidth);
          } else {
            const x =
              textAlignmentPosition.x - textElementWidths[textElement.key];
            usedComponent.x = convertValueToPercent(x, canvasWidth);
          }
        });
      })
    );
  }

  // UPDATE DATA

  function handleUpdatePositionOrWidth({
    productField,
    component,
    componentField,
    newValue,
  }) {
    setProductModified(
      produce((draft) => {
        const draftField = draft[productField];

        let fieldComponents;

        if (productField === 'images') {
          const draftElement = findElement(component.id, draftField);
          fieldComponents = draftElement[componentField];
        } else if (productField === 'textAlignmentPosition') {
          fieldComponents = draftField;
        } else {
          fieldComponents = draftField[componentField];
        }

        const usedComponent = selectComponent(
          fieldComponents,
          device,
          'aspectRatio'
        );

        if (usedComponent.aspectRatio === device.aspectRatio) {
          deleteElement(usedComponent, fieldComponents, 'aspectRatio');
        }

        const newComponent = {};
        newComponent.aspectRatio = device.aspectRatio;

        if (productField === 'textAlignmentPosition') {
          newComponent.value = convertValueToPercent(newValue.x, canvasWidth);
        } else if (componentField === 'positions') {
          newComponent.x = convertValueToPercent(newValue.x, canvasWidth);
          newComponent.y = convertValueToPercent(
            newValue.y,
            singleScreenCanvasHeight
          );
        } else {
          newComponent.value = newValue;
        }
        fieldComponents.push(newComponent);
      })
    );
    setUnsavedChange(true);
  }

  function handleUpdateOrderOrLayer(componentToUpdate, field, newValue) {
    setProductModified(
      produce((draft) => {
        const draftComponent = findElement(componentToUpdate.id, draft.images);
        draftComponent[field] = newValue;
      })
    );
    setUnsavedChange(true);
  }

  function handleUpdateShopHomeStatus(newMainComponent) {
    setProductModified(
      produce((draft) => {
        draft.images.forEach((component) => {
          component.shopHomeStatus =
            component.id === newMainComponent.id ? 'main' : 'none';
        });
      })
    );
    setUnsavedChange(true);
  }

  function handleAddImage(image) {
    const newElement = createImageComponent({
      id: uuidv4(),
      orderAndLayerValue: productModified.images.length + 1,
      image,
      device,
    });
    setProductModified(
      produce((draft) => {
        draft.images.push(newElement);
      })
    );
    setUnsavedChange(true);
  }

  const handleDeleteImage = (imageToDelete) =>
    confirmWrapper('delete', () => {
      setProductModified(
        produce((draft) => {
          const draftImages = draft.images;
          const draftIndex = draftImages.findIndex(
            (component) => component.id === imageToDelete.id
          );
          draftImages.splice(draftIndex, 1);

          // process orders and layers
          sortByAscending(draftImages, 'order');
          draftImages.forEach((component, i) => {
            component.order = i + 1;

            if (component.layer > draftImages.length) {
              component.layer = draftImages.length;
            }
          });
        })
      );

      setUnsavedChange(true);
    });

  const undoChanges = () =>
    confirmWrapper('undo', () => {
      setProductModified(productProcessed);
      setUnsavedChange(false);
    });

  function save() {}

  // DERIVED DATA

  const productTextFields = useMemo(
    () =>
      productModified
        ? [
            { key: 'addToCartButton', text: 'Add to Cart.' },
            { key: 'productDiscount', text: '£100' },
            {
              key: 'productViewDescription',
              text: productModified.descriptionJsx,
            },
            { key: 'productViewPrice', text: productModified.price },
            { key: 'productViewTitle', text: productModified.title },
          ]
        : null,
    [productModified]
  );

  const textAlignmentPosition = useMemo(
    () => (productModified ? handleSelectAlignmentPosition() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productModified]
  );

  return (
    <ContentPageWrapper
      controls={{
        addElements: [
          { text: 'image', func: () => setShowEditImagePopup(true) },
        ],
        device: true,
        undoChanges,
        save,
        back: '/shop',
      }}
      editImagePopup={
        <EditImagePopup
          show={showEditImagePopup}
          close={() => setShowEditImagePopup(false)}
          handleImage={({ data }) => handleAddImage(data)}
        />
      }
    >
      {singleScreenBodyHeight && singleScreenCanvasHeight && canvasWidth && (
        <div
          css={[
            canvas,
            {
              width: canvasWidth,
              height: singleScreenCanvasHeight,
              top: (singleScreenBodyHeight - singleScreenCanvasHeight) / 2,
            },
          ]}
        >
          {productModified && (
            <React.Fragment>
              {productModified.images.map((component) => (
                <RndElement
                  width={
                    selectComponent(component.widths, device, 'aspectRatio')
                      .value
                  }
                  position={handleSelectPosition(component)}
                  zIndex={productModified.images.length - component.layer}
                  updatePosition={(newValue) =>
                    handleUpdatePositionOrWidth({
                      productField: 'images',
                      component,
                      componentField: 'positions',
                      newValue,
                    })
                  }
                  updateWidth={(newValue) =>
                    handleUpdatePositionOrWidth({
                      productField: 'images',
                      component,
                      componentField: 'widths',
                      newValue,
                    })
                  }
                  enableResizing={{
                    right: true,
                    bottom: true,
                    bottomRight: true,
                  }}
                  key={component.id}
                >
                  <ImageElement
                    src={selectImage(component.image.image, 'medium')}
                    canvasWidth={canvasWidth}
                    canvasHeight={singleScreenCanvasHeight}
                    numberComponents={productModified.images.length}
                    shopHomeStatus={component.shopHomeStatus}
                    order={component.order}
                    layer={component.layer}
                    updateShopHomeStatus={() =>
                      handleUpdateShopHomeStatus(component)
                    }
                    updateOrder={(newValue) =>
                      handleUpdateOrderOrLayer(component, 'order', newValue)
                    }
                    updateLayer={(newValue) =>
                      handleUpdateOrderOrLayer(component, 'layer', newValue)
                    }
                    deleteElement={() => handleDeleteImage(component)}
                  />
                </RndElement>
              ))}
              {productTextFields.map((textData, i) => (
                <RndElement
                  position={handleSelectPosition(productModified[textData.key])}
                  updatePosition={(newValue) =>
                    handleUpdatePositionOrWidth({
                      productField: textData.key,
                      componentField: 'positions',
                      newValue,
                    })
                  }
                  key={i}
                >
                  <TextElement
                    text={textData.text}
                    canvasWidth={canvasWidth}
                    canvasHeight={singleScreenCanvasHeight}
                    widthSet={textElementWidths[textData.key]}
                    setWidth={(value) =>
                      setTextElementWidths((state) => {
                        return { ...state, [textData.key]: value };
                      })
                    }
                  />
                </RndElement>
              ))}
              <RndElement
                position={textAlignmentPosition}
                width="20"
                widthUnit="px"
                height={singleScreenCanvasHeight}
                dragAxis="x"
                updatePosition={(newValue) =>
                  handleUpdatePositionOrWidth({
                    productField: 'textAlignmentPosition',
                    newValue,
                  })
                }
              >
                <TextAlignmentElement alignText={alignText} />
              </RndElement>
            </React.Fragment>
          )}
        </div>
      )}
    </ContentPageWrapper>
  );
}

const Product = () => (
  <ContentPageProvider page="product">
    <Content />
  </ContentPageProvider>
);

export default Product;
