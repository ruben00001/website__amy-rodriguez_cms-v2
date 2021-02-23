import {
  useState,
  useContext,
  createContext,
  useEffect,
  useLayoutEffect,
} from 'react';
import axios from 'axios';
import Client from 'shopify-buy';
import produce from 'immer';

import { useFetch } from './FetchContext';
import useAsync from '../hooks/useAsync';

const DataContext = createContext();
const { Provider } = DataContext;

function DataProvider({ children }) {
  // const [images, setImages] = useState(null);
  // const [defaultProduct, setDefaultProduct] = useState(null);
  // const [shopHeight, setShopHeight] = useState(null);
  // const [shopifyProducts, setShopifyProducts] = useState(null);
  // const [portfolio, setPortfolio] = useState(null);
  // const [pressElements, setPressElements] = useState(null);
  // const [strapiProducts, setStrapiProducts] = useState(null);
  // const [status, setStatus] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [status, setStatus] = useState('idle');

  const { authFetch, strapiEndpoints } = useFetch();

  const { data: imagesData, status: imagesStatus, run: runImages } = useAsync();
  const { data: uploadData, status: uploadStatus, run: runUpload } = useAsync();
  const {
    data: portfolioData,
    status: portfolioStatus,
    run: runPortfolio,
  } = useAsync();
  const {
    data: shopHeightData,
    status: shopHeightStatus,
    run: runShopHeight,
  } = useAsync();
  const {
    data: strapiProductData,
    status: strapiProductStatus,
    run: runStrapiProduct,
  } = useAsync();
  const {
    data: shopifyProductData,
    status: shopifyProductStatus,
    run: runShopifyProduct,
  } = useAsync();
  const { data: pressData, status: pressStatus, run: runPress } = useAsync();

  useEffect(() => {
    if (triggerFetch) {
      console.log('FETCHING INITIAL DATA...');
      runImages(axios.get(strapiEndpoints.images));
      runUpload(axios.get(strapiEndpoints.uploads));
      runPortfolio(axios.get(strapiEndpoints.portfolioPages));
      runShopHeight(axios.get(strapiEndpoints.shopHeights));
      runStrapiProduct(axios.get(strapiEndpoints.products));
      const shopifyClient = Client.buildClient({
        storefrontAccessToken: 'aec2e7a9ff50e738535be4a359037f1f',
        domain: 'amy-jewellery-x.myshopify.com',
      });
      runShopifyProduct(shopifyClient.product.fetchAll(250));
      runPress(axios.get(strapiEndpoints.pressElements));

      // async function fetchAndCleanAllDataAndRemoveInvalidDataFromDatabase() {
      //   console.log('FETCHING INITIAL DATA...');
      //   setStatus('pending');

      //   try {
      //     // FETCH DATA

      //     const strapiResponse = await axios.all(
      //       strapiEndpoints.map((endPoint) =>
      //         authFetch.get(endPoint + limitParameter)
      //       )
      //     );
      //     const [
      //       portfolio,
      //       strapiProducts,
      //       shopHeight,
      //       defaultProduct,
      //       allImages,
      //       pressElements,
      //       uploads,
      //     ] = strapiResponse.map((response) => response.data);

      //     setShopHeight(shopHeight);
      //     setPressElements(pressElements);
      //     setDefaultProduct(defaultProduct);

      //     const shopifyProducts = await fetchShopifyProducts();
      //     setShopifyProducts(shopifyProducts);

      //     // HANDLE INVALID PRODUCTS

      //     const unusedStrapiProducts = strapiProducts.filter(
      //       (strapiProduct) =>
      //         !shopifyProducts.find(
      //           (shopifyProduct) =>
      //             shopifyProduct.id === strapiProduct.shopifyId
      //         )
      //     );

      //     await axios.all(
      //       unusedStrapiProducts.map((product) =>
      //         authFetch.delete(`products/${product.id}`)
      //       )
      //     );

      //     // HANDLE UNUSED IMAGES
      //     const portfolioImageIds = portfolio
      //       .map((page) =>
      //         page.imageComponents.map(
      //           (imageComponent) => imageComponent.image.id
      //         )
      //       )
      //       .flat();

      //     const usedStrapiProducts = strapiProducts.filter((strapiProduct) =>
      //       shopifyProducts.find(
      //         (shopifyProduct) => shopifyProduct.id === strapiProduct.shopifyId
      //       )
      //     );
      //     const productImageIds = usedStrapiProducts
      //       .map((product) =>
      //         product.images.map((imageComponent) => imageComponent.image.id)
      //       )
      //       .flat();
      //     const usedImageIds = [
      //       ...new Set([...portfolioImageIds, ...productImageIds]),
      //     ];
      //     const unusedImages = allImages.filter(
      //       (image) => !usedImageIds.includes(image.id)
      //     );

      //     await axios.all(
      //       unusedImages.map((image) => authFetch.delete(`images/${image.id}`))
      //     );

      //     // HANDLE UNUSED UPLOADS

      //     const portfolioUploadIds = portfolio
      //       .map((page) =>
      //         page.imageComponents.map(
      //           (imageComponent) => imageComponent.image.image.id
      //         )
      //       )
      //       .flat();

      //     const productUploadIds = usedStrapiProducts
      //       .map((product) =>
      //         product.images.map(
      //           (imageComponent) => imageComponent.image.image.id
      //         )
      //       )
      //       .flat();

      //     const usedUploadIds = [
      //       ...new Set([...portfolioUploadIds, ...productUploadIds]),
      //     ];

      //     const unusedUploads = uploads.filter(
      //       (upload) => !usedUploadIds.includes(upload.id)
      //     );

      //     await axios.all(
      //       unusedUploads.map((upload) =>
      //         authFetch.delete(`upload/files/${upload.id}`)
      //       )
      //     );

      //     // REMOVE INVALID UPLOADS FROM USED UPLOADS
      //     const usedUploads = uploads.filter((upload) =>
      //       usedUploadIds.includes(upload.id)
      //     );
      //     const invalidUploads = usedUploads.filter((upload) => !upload.url);

      //     await axios.all(
      //       invalidUploads.map((upload) =>
      //         authFetch.delete(`upload/files/${upload.id}`)
      //       )
      //     );

      //     // REMOVE INVALID IMAGES FROM USED IMAGES
      //     const usedImages = allImages.filter((image) =>
      //       usedImageIds.includes(image.id)
      //     );
      //     const invalidImages = usedImages.filter((image) => !image.image);
      //     const validImages = usedImages.filter((image) => image.image);

      //     setImages(validImages);

      //     await axios.all(
      //       invalidImages.map((image) => authFetch.delete(`images/${image.id}`))
      //     );

      //     // FETCH PORTFOLIO AND PRODUCTS AGAIN
      //     const newStrapiResponse = await axios.all([
      //       authFetch.get('portfolio-pages'),
      //       authFetch.get('products'),
      //     ]);
      //     const [
      //       portfolioWithInvalidImagesRemoved,
      //       cleanProducts,
      //     ] = newStrapiResponse.map((res) => res.data);

      //     setStrapiProducts(cleanProducts);

      //     // REMOVE UNUSED PORTFOLIO PAGES
      //     const unusedPortfolioPages = portfolioWithInvalidImagesRemoved.filter(
      //       (page) => !page.imageComponents[0]
      //     );

      //     await axios.all(
      //       unusedPortfolioPages.map((page) =>
      //         authFetch.delete(`portfolio-pages/${page.id}`)
      //       )
      //     );

      //     // REORDER PORTFOLIO PAGES
      //     const usedPortfolioPages = portfolioWithInvalidImagesRemoved.filter(
      //       (page) => page.imageComponents[0]
      //     );

      //     const portfolioReordered = produce(usedPortfolioPages, (draft) => {
      //       draft.sort((a, b) => a.order - b.order);
      //       draft.forEach((page, i) => {
      //         if (page.order !== i + 1) {
      //           page.order = i + 1;
      //           page.changed = true;
      //         }
      //       });
      //     });
      //     const reorderedPages = portfolioReordered.filter(
      //       (page) => page.changed
      //     );
      //     console.log(
      //       '🚀 ~ file: DataContext.js ~ line 213 ~ fetchAndCleanAllDataAndRemoveInvalidDataFromDatabase ~ reorderedPages',
      //       reorderedPages
      //     );

      //     await axios.all(
      //       reorderedPages.map((page) =>
      //         authFetch.put(`portfolio-pages/${page.id}`, page)
      //       )
      //     );

      //     setPortfolio(portfolioReordered);

      //     setStatus('resolved');
      //     setTimeout(() => {
      //       setStatus('complete');
      //     }, 800);
      //   } catch (error) {
      //     // should be able to differentiate between errors and allow app to work in sections where possible
      //     setStatus('rejected');
      //   }
      // }
      // fetchAndCleanAllDataAndRemoveInvalidDataFromDatabase();
    }
  }, [triggerFetch]);

  // async function fetchShopifyProducts() {
  //   const shopifyClient = Client.buildClient({
  //     storefrontAccessToken: 'aec2e7a9ff50e738535be4a359037f1f',
  //     domain: 'amy-jewellery-x.myshopify.com',
  //   });

  //   return await shopifyClient.product.fetchAll(250);
  // }
  async function processStrapiProducts() {
    console.log(strapiProductData);
    console.log(shopifyProductData);
  }

  const value = {
    triggerFetch: triggerFetch,
    fetchData: () => setTriggerFetch(true),
    // images,
    // portfolio,
    // pressElements,
    // strapiProducts,
    // shopifyProducts,
    // shopHeight,
    // defaultProduct,
    // status,
    // setDefaultProduct,
    // setShopHeight,
    // setShopifyProducts,
    // setPortfolio,
    // setStrapiProducts,
    // setPressElements,
  };

  return <Provider value={value}>{children}</Provider>;
}

function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within the DataProvider');

  const { triggerFetch, fetchData } = context;

  useLayoutEffect(() => {
    if (!triggerFetch) {
      fetchData();
    }
  }, [triggerFetch, fetchData]);

  return context;
}

export { DataProvider, useData };
