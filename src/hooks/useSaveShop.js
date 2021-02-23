import axios from 'axios';
import produce from 'immer';
import { useLayoutEffect } from 'react';
import { useData } from '../context/DataContext';
import { useFetch } from '../context/FetchContext';
// import { removeTemporaryFieldsFromNewImageComponents } from '../utils';
import useAsync from './useAsync';

function useSaveShop(setUnsavedChange) {
  const { data, status, run, reset } = useAsync();
  const {
    strapiProducts: strapiProductsRoot,
    setStrapiProducts: setStrapiProductsRoot,
    setShopHeight: setShopHeightRoot,
  } = useData();
  const { authFetch } = useFetch();

  useLayoutEffect(() => {
    // what to do for reject?
    if (status === 'resolved') {
      const newProductResponses = data.filter(
        (response) =>
          response.config.method === 'post' &&
          response.config.url.includes('products')
      );
      const updatedProductResponses = data.filter(
        (response) =>
          response.config.method === 'put' &&
          response.config.url.includes('products')
      );
      const newShopHeightResponses = data.filter(
        (response) =>
          response.config.method === 'post' &&
          response.config.url.includes('shop-home-heights')
      );
      const updatedShopHeightResponses = data.filter(
        (response) =>
          response.config.method === 'put' &&
          response.config.url.includes('shop-home-heights')
      );

      setStrapiProductsRoot(
        produce((draft) => {
          newProductResponses.forEach((product) => draft.push(product.data));
          updatedProductResponses.forEach((updatedResponse) => {
            const draftIndex = draft.findIndex(
              (draftPage) => draftPage.id === updatedResponse.data.id
            );
            draft.splice(draftIndex, 1, updatedResponse.data);
          });
        })
      );
      setShopHeightRoot(
        produce((draft) => {
          newShopHeightResponses.forEach((height) => draft.push(height.data));
          updatedShopHeightResponses.forEach((updatedResponse) => {
            const draftIndex = draft.findIndex(
              (draftPage) => draftPage.id === updatedResponse.data.id
            );
            draft.splice(draftIndex, 1, updatedResponse.data);
          });
        })
      );

      setUnsavedChange(false);
      setTimeout(() => {
        reset();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function save(productsModified, shopPageHeightsModified) {
    // const newProducts = productsModified.filter((product) => product.new);
    // const newProductsProcessed = newProducts.map(
    //   ({ images, shopifyId, positions, widths }) => {
    //     const imagesProcessed = removeTemporaryFieldsFromNewImageComponents(
    //       images
    //     );
    //     return {
    //       images: imagesProcessed,
    //       shopifyId,
    //       shopHomeImgPositions: positions,
    //       shopHomeImgWidths: widths,
    //     };
    //   }
    // );
    // const updatedProducts = productsModified.filter(
    //   (product) => product.updated && !product.new
    // );
    // const updatedProductsProcessed = [];
    // updatedProducts.forEach((updatedProduct) => {
    //   const strapiProductRoot = strapiProductsRoot.find(
    //     (product) => product.id === updatedProduct.id
    //   );
    //   const updatedStrapiProduct = produce(strapiProductRoot, (draft) => {
    //     const imageComponentsProcessed = removeTemporaryFieldsFromNewImageComponents(
    //       updatedProduct.images
    //     );
    //     return {
    //       ...draft,
    //       images: imageComponentsProcessed,
    //       shopHomeImgPositions: updatedProduct.positions,
    //       shopHomeImgWidths: updatedProduct.widths,
    //     };
    //   });
    //   updatedProductsProcessed.push(updatedStrapiProduct);
    // });
    // const newShopHeights = shopPageHeightsModified.filter(
    //   (height) => height.new
    // );
    // const newShopHeightsProcessed = newShopHeights.map(
    //   ({ aspectRatio, value }) => {
    //     return { aspectRatio, value };
    //   }
    // );
    // const updatedShopHeights = shopPageHeightsModified.filter(
    //   (height) => height.updated
    // );
    // const updatedShopHeightsProcessed = updatedShopHeights.map(
    //   ({ id, aspectRatio, value }) => {
    //     return { id, aspectRatio, value };
    //   }
    // );
    // run(
    //   axios.all(
    //     [
    //       newProductsProcessed.map((product) =>
    //         authFetch.post('products', product)
    //       ),
    //       updatedProductsProcessed.map((product) =>
    //         authFetch.put(`products/${product.id}`, product)
    //       ),
    //       newShopHeightsProcessed.map((height) =>
    //         authFetch.post('shop-home-heights', height)
    //       ),
    //       updatedShopHeightsProcessed.map((height) =>
    //         authFetch.put(`shop-home-heights/${height.id}`, height)
    //       ),
    //     ].flat()
    //   )
    // );
  }

  return { save, status };
}

export default useSaveShop;
