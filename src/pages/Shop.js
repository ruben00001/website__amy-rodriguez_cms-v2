/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '../context/DataContext';
import {
  ContentPageProvider,
  useContentPage,
} from '../context/ContentPageContext';

import {
  interpretMultipleFetchStatuses,
  confirmWrapper,
  selectComponent,
  selectImage,
  deleteElement,
  createImageComponent,
} from '../utils/contentPageUtils';
import {
  calcPercentageValue,
  convertValueToPercent,
  filterNew,
  filterUpdated,
  findElement,
  scrollToBottom,
  scrollToTop,
} from '../utils';

import ContentPageWrapper from '../components/common/ContentPageWrapper';

import { canvasDefault } from '../components/common/styles';
import RndElement from '../components/common/RndElement';
import PageFold from '../components/common/PageFold';
import Product from '../components/shop/Product';
import produce from 'immer';
import EditImagePopup from '../components/common/EditImagePopup';
import { processSaveResData } from '../utils/processData';

const canvas = css(canvasDefault, {
  width: '100%',
  height: '100%',
});

/* NOTES
  - new product: create zone above canvas for new products. either post new strapiProduct or use placeholder.
  - should maybe disable dragging of images when dragging page
  - z index for shop images?
  - ability to zoom out
  - why did new product create multiple versions of itself?
*/

function Content() {
  const [productsModified, setProductsModified] = useState(null);
  const [shopHeightsModified, setShopHeightsModified] = useState(null);
  const [editedElement, setEditedElement] = useState(null);
  const [collection, setCollection] = useState('all');

  const {
    setUnsavedChange,
    device,
    handleSave,
    mapFetches,
    bodyWidth,
    canvasWidth,
    singleScreenCanvasHeight,
  } = useContentPage();

  // HANDLE ROOT DATA

  const {
    strapiProductsRoot,
    shopifyProducts,
    shopifyCollections,
    shopHeightsRoot,
  } = useData();

  const rootDataFetchStatus = useMemo(
    () =>
      interpretMultipleFetchStatuses([
        strapiProductsRoot.fetchStatus,
        shopifyProducts.fetchStatus,
        shopifyCollections.fetchStatus,
        shopHeightsRoot.fetchStatus,
      ]),
    [
      shopHeightsRoot.fetchStatus,
      shopifyCollections.fetchStatus,
      shopifyProducts.fetchStatus,
      strapiProductsRoot.fetchStatus,
    ]
  );

  const shopHeightsRootProcessed = useMemo(() => {
    if (!shopHeightsRoot.data || !shopifyCollections.data) return;

    let shopHeights = [...shopHeightsRoot.data];

    if (!findElement('all', shopHeights, 'collectionId')) {
      shopHeights.push({
        collectionId: 'all',
        heights: [{ aspectRatio: 1.8, value: 1 }],
        new: true,
      });
    }
    shopifyCollections.data.forEach((collection) => {
      const shopHeightsExistForCollection = findElement(
        collection.id,
        shopHeights,
        'collectionId'
      );
      if (!shopHeightsExistForCollection) {
        const defaultCollection = {
          collectionId: collection.id,
          heights: [{ aspectRatio: 1.8, value: 1 }],
          new: true,
        };
        shopHeights.push(defaultCollection);
      }
    });

    return shopHeights;
  }, [shopHeightsRoot.data, shopifyCollections.data]);

  useLayoutEffect(() => {
    if (shopHeightsRootProcessed) {
      setShopHeightsModified(shopHeightsRootProcessed);
    }
  }, [shopHeightsRootProcessed]);

  const productsRootProcessed = useMemo(() => {
    if (
      !shopifyProducts.data ||
      !strapiProductsRoot.data ||
      !shopifyCollections.data
    )
      return;

    const collections = shopifyCollections.data;

    const productsProcessed = shopifyProducts.data.map((shopifyProduct) => {
      const defaultStrapiProduct = {
        id: uuidv4(),
        images: [],
        shopHomeImgPositions: [{ aspectRatio: 1.8, x: 0, y: -5 }],
        shopHomeImgWidths: [{ aspectRatio: 1.8, value: 20 }],
        // collections: [],
        new: true,
      };
      const strapiProduct =
        findElement(shopifyProduct.id, strapiProductsRoot.data, 'shopifyId') ||
        defaultStrapiProduct;

      const productCollectionData = strapiProduct.collections
        ? [...strapiProduct.collections]
        : [];

      collections.forEach((collection) => {
        const productExistsInCollection = collection.products.find(
          (collectionProduct) => collectionProduct.id === shopifyProduct.id
        );
        if (productExistsInCollection) {
          const collectionDataAlreadyExists =
            strapiProduct.collections &&
            strapiProduct.collections.find(
              (existingCollection) =>
                existingCollection.collectionId === collection.id
            );
          if (!collectionDataAlreadyExists) {
            const dataObject = {
              collectionId: collection.id,
              positions: [{ aspectRatio: 1.8, x: 0, y: -5 }],
              widths: [{ aspectRatio: 1.8, value: 20 }],
            };
            productCollectionData.push(dataObject);
          }
        }
      });

      return {
        id: strapiProduct.id,
        shopifyId: shopifyProduct.id,
        images: strapiProduct.images,
        positions: strapiProduct.shopHomeImgPositions,
        widths: strapiProduct.shopHomeImgWidths,
        collections: productCollectionData,
        price: shopifyProduct.variants[0].price,
        title: shopifyProduct.title,
        description: shopifyProduct.description,
        new: strapiProduct.new ? true : false,
      };
    });

    return productsProcessed;
  }, [shopifyCollections.data, shopifyProducts.data, strapiProductsRoot.data]);

  useLayoutEffect(() => {
    if (productsRootProcessed) {
      setProductsModified(productsRootProcessed);
    }
  }, [productsRootProcessed]);

  const resetRootDataFetch = () => {
    strapiProductsRoot.resetFetch();
    shopifyProducts.resetFetch();
    shopifyCollections.resetFetch();
    shopHeightsRoot.resetFetch();
  };

  // HELPERS

  function handleSelectPosition(component) {
    let components;

    if (collection === 'all') {
      components = component.positions;
    } else {
      const collectionData = component.collections.find(
        (componentCollection) => componentCollection.collectionId === collection
      );
      components = collectionData.positions;
    }

    const { x, y } = selectComponent(components, device, 'aspectRatio');
    return {
      x: calcPercentageValue(x, canvasWidth),
      y: calcPercentageValue(y, singleScreenCanvasHeight),
    };
  }

  function handleSelectWidth(component) {
    let components;

    if (collection === 'all') {
      components = component.widths;
    } else {
      const collectionData = component.collections.find(
        (componentCollection) => componentCollection.collectionId === collection
      );
      components = collectionData.widths;
    }

    return selectComponent(components, device, 'aspectRatio').value;
  }

  function handleSelectImage(images) {
    const image = images.find((image) => image.shopHomeStatus === 'main');

    return image ? selectImage(image.image.image, 'medium') : null;
  }

  function hasSavedMainImage(product) {
    const mainImage = product.images.find(
      (image) => image.shopHomeStatus === 'main'
    );

    if (!mainImage) return false;

    const mainImageIsNew = mainImage.new;

    if (!mainImageIsNew) return true;

    const rootProduct = findElement(product.id, strapiProductsRoot.data);

    if (!rootProduct) return false;

    const rootMainImage = rootProduct.images.find(
      (image) => image.shopHomeStatus === 'main'
    );

    if (rootMainImage) return true;

    return false;
  }

  function moveToBot(product) {
    const usedComponent = selectComponent(
      product.positions,
      device,
      'aspectRatio'
    );

    handleUpdatePositionOrWidth(product, 'positions', {
      x: calcPercentageValue(usedComponent.x, canvasWidth),
      y: canvasHeight,
    });

    scrollToBottom();
  }

  function moveToTop(product) {
    const usedComponent = selectComponent(
      product.positions,
      device,
      'aspectRatio'
    );

    handleUpdatePositionOrWidth(product, 'positions', {
      x: calcPercentageValue(usedComponent.x, canvasWidth),
      y: -50,
    });

    scrollToTop();
  }

  function productInCollection(product) {
    if (collection === 'all') return true;

    const collections = shopifyCollections.data;
    const selectedCollectionId = collection;
    const selectedCollection = collections.find(
      (collection) => collection.id === selectedCollectionId
    );
    const collectionProducts = selectedCollection.products;

    if (
      collectionProducts.find(
        (collectionProduct) => collectionProduct.id === product.shopifyId
      )
    )
      return true;

    return false;
  }

  // UPDATE DATA

  function handleUpdateCanvas(newHeight) {
    const newMultiplier = newHeight / singleScreenCanvasHeight;

    setShopHeightsModified(
      produce((draft) => {
        const draftElement = draft.find(
          (shopHeights) => shopHeights.collectionId === collection
        );

        const usedComponent = selectComponent(
          draftElement.heights,
          device,
          'aspectRatio'
        );

        if (usedComponent.aspectRatio === device.aspectRatio) {
          usedComponent.value = newMultiplier;
        } else {
          const newComponent = {};
          newComponent.aspectRatio = device.aspectRatio;
          newComponent.value = newMultiplier;
          // newComponent.new = true;

          draftElement.heights.push(newComponent);
        }

        draftElement.updated = true;
      })
    );

    setUnsavedChange(true);
  }

  function handleUpdatePositionOrWidth(element, field, newValue) {
    setProductsModified(
      produce((draft) => {
        const draftElement = findElement(element.shopifyId, draft, 'shopifyId');
        // const fieldComponents = draftElement[field];
        let fieldComponents;

        if (collection === 'all') {
          fieldComponents = draftElement[field];
        } else {
          const collectionData = draftElement.collections.find(
            (componentCollection) =>
              componentCollection.collectionId === collection
          );
          fieldComponents = collectionData[field];
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

        if (field === 'positions') {
          newComponent.x = convertValueToPercent(newValue.x, canvasWidth);
          newComponent.y = convertValueToPercent(
            newValue.y,
            singleScreenCanvasHeight
          );
        } else {
          newComponent.value = newValue;
        }
        fieldComponents.push(newComponent);

        draftElement.updated = true;
      })
    );

    setUnsavedChange(true);
  }

  function handleNewImage({ type, data }) {
    setProductsModified(
      produce((draft) => {
        const draftElement = findElement(
          editedElement.shopifyId,
          draft,
          'shopifyId'
        );
        const imageComponents = draftElement.images;

        if (type === 'product') {
          imageComponents.forEach((imageComponent) => {
            const newMainImageId = data.id;
            imageComponent.shopHomeStatus =
              imageComponent.id === newMainImageId ? 'main' : 'none';
          });
        } else {
          imageComponents.forEach(
            (imageComponent) => (imageComponent.shopHomeStatus = 'none')
          );
          const newImageComponent = createImageComponent({
            id: uuidv4(),
            orderAndLayerValue: imageComponents.length + 1,
            image: data,
            device,
            page: 'shop',
          });
          imageComponents.push(newImageComponent);
        }
        draftElement.updated = true;
      })
    );

    setUnsavedChange(true);
  }

  function undoChanges() {
    confirmWrapper('undo', () => {
      setShopHeightsModified(shopHeightsRoot.data);
      setProductsModified(productsRootProcessed);
      setUnsavedChange(false);
    });
  }

  function save() {
    function handleSaveResponse(responses) {
      const productResponses = responses.filter((res) =>
        res.config.url.includes('products')
      );
      const shopHeightResponses = responses.filter(
        (res) => !res.config.url.includes('products')
      );

      processSaveResData(productResponses, strapiProductsRoot.setData);
      processSaveResData(shopHeightResponses, shopHeightsRoot.setData);
    }

    const strapiProductsModified = productsModified.map((product) => {
      return {
        id: product.id,
        images: product.images,
        shopifyId: product.shopifyId,
        shopHomeImgPositions: product.positions,
        shopHomeImgWidths: product.widths,
        collections: product.collections,
        new: product.new ? true : false,
        updated: product.updated ? true : false,
      };
    });

    const newProducts = filterNew(strapiProductsModified);
    const newProductsProcessed = produce(newProducts, (draft) => {
      draft.forEach((product) => {
        delete product.id;

        product.images.forEach((imageComponent) => {
          delete imageComponent.id;
        });
      });
    });

    const updatedProducts = filterUpdated(strapiProductsModified);
    const updatedProductsProcessed = produce(updatedProducts, (draft) => {
      draft.forEach((product) => {
        product.images.forEach((imageComponent) => {
          if (imageComponent.new) {
            delete imageComponent.id;
          }
        });
      });
    });

    const newShopHeights = filterNew(shopHeightsModified);
    const updatedShopHeights = filterUpdated(shopHeightsModified);

    handleSave(
      [
        mapFetches(newProductsProcessed, 'post', 'products'),
        mapFetches(updatedProductsProcessed, 'put', 'products'),
        mapFetches(newShopHeights, 'post', 'shopHeights'),
        mapFetches(updatedShopHeights, 'put', 'shopHeights'),
      ],
      handleSaveResponse
    );
  }

  // DERIVED DATA

  const canvasHeight = useMemo(() => {
    if (!singleScreenCanvasHeight || !shopHeightsModified || !device) return;

    const collectionData = shopHeightsModified.find(
      (shopHeights) => shopHeights.collectionId === collection
    );

    return (
      selectComponent(collectionData.heights, device, 'aspectRatio').value *
      singleScreenCanvasHeight
    );
  }, [collection, device, shopHeightsModified, singleScreenCanvasHeight]);

  return (
    <ContentPageWrapper
      rootDataFetchStatus={rootDataFetchStatus}
      resetRootDataFetch={resetRootDataFetch}
      controls={{
        device: true,
        productCollection: { update: setCollection },
        undoChanges,
        save,
      }}
      editImagePopup={
        <EditImagePopup
          show={editedElement}
          close={() => setEditedElement(null)}
          handleImage={(newImage) => handleNewImage(newImage)}
          productImages={editedElement?.images}
        />
      }
    >
      {canvasWidth && bodyWidth && canvasHeight && (
        <RndElement
          positionType="static"
          width={(canvasWidth / bodyWidth) * 100}
          height={canvasHeight}
          position={{
            x: (bodyWidth - canvasWidth) / 2,
            y: 100,
          }}
          updateHeight={handleUpdateCanvas}
          lockAspectRatio={false}
          disableDragging={true}
          enableResizing={{ bottom: true }}
          cloneProps={false}
        >
          <div css={canvas}>
            {device &&
              productsModified &&
              productsModified
                .filter((product) => productInCollection(product))
                .map((product) => (
                  <RndElement
                    position={handleSelectPosition(product)}
                    width={
                      handleSelectWidth(product)
                      // selectComponent(product.widths, device, 'aspectRatio')
                      //   .value
                    }
                    updatePosition={(newValue) =>
                      handleUpdatePositionOrWidth(
                        product,
                        'positions',
                        newValue
                      )
                    }
                    updateWidth={(newValue) =>
                      handleUpdatePositionOrWidth(product, 'widths', newValue)
                    }
                    enableResizing={{
                      right: true,
                      bottom: true,
                      bottomRight: true,
                    }}
                    key={product.shopifyId}
                  >
                    <Product
                      imgSrc={handleSelectImage(product.images)}
                      title={product.title}
                      description={product.description}
                      price={product.price}
                      shopifyId={product.shopifyId}
                      hasSavedMainImage={hasSavedMainImage(product)}
                      canvasWidth={canvasWidth}
                      canvasHeight={canvasHeight}
                      editElementImage={() => setEditedElement(product)}
                      moveToBot={() => moveToBot(product)}
                      moveToTop={() => moveToTop(product)}
                    />
                  </RndElement>
                ))}
            <PageFold top={singleScreenCanvasHeight} />
          </div>
        </RndElement>
      )}
    </ContentPageWrapper>
  );
}

function Shop() {
  return (
    <ContentPageProvider page="shop">
      <Content />
    </ContentPageProvider>
  );
}

export default Shop;
