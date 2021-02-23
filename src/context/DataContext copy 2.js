import { useState, useContext, createContext, useEffect } from 'react';
import Client from 'shopify-buy';
import produce from 'immer';

import { useFetch } from './FetchContext';
import useAsync from '../hooks/useAsync';
import {
  deleteComponentFromParent,
  filterStrapiProducts,
  removeInvalidImageComponentsAndFlagElementIfUpdated,
  sortComponentsAndFlagIfUpdated,
} from '../utils';
import axios from 'axios';

const DataContext = createContext();
const { Provider } = DataContext;

/* NOTES
  - should have useAsync for the requests made in processing data too?
  - next: finish process product data
  - ensure all processing is self-encapsulating. Maybe is a good principle; also maybe can move processing to respective pages. Want it so that can work on parts of the site that haven't been affected by rejected request. Can also attempt to refetch.
*/

function DataProvider({ children }) {
  const [imagesRoot, setImagesRoot] = useState(null);
  const [portfolioRoot, setPortfolioRoot] = useState(null);
  const [shopHeightsRoot, setShopHeightsRoot] = useState(null);
  const [pressElementsRoot, setPressElementsRoot] = useState(null);
  const [strapiProductsRoot, setStrapiProductsRoot] = useState(null);
  const [settingsRoot, setSettingsRoot] = useState(null);

  const [initialDataFetchInvoked, setInitialDataFetchInvoked] = useState(false);
  const [
    strapiProductProcessingInvoked,
    setStrapiProductProcessingInvoked,
  ] = useState(false);
  const [
    uploadAndImageProcessingInvoked,
    setUploadAndImageProcessingInvoked,
  ] = useState(false);

  const [portfolioProcessingInvoked, setPortfolioProcessingInvoked] = useState(
    // should be a reducer for these 4 states
    false
  );
  const [portfolioComplete, setPortfolioComplete] = useState(false);
  const [pressProcessingInvoked, setPressProcessingInvoked] = useState(false);
  const [portfolioFetchToggle, setPortfolioFetchToggle] = useState(false);

  const { authFetch, strapiEndpoints } = useFetch();

  const { data: imagesRes, status: imagesStatus, run: runImages } = useAsync();
  const { data: uploadRes, status: uploadStatus, run: runUpload } = useAsync();
  const {
    data: portfolioRes,
    status: portfolioStatus,
    run: runPortfolio,
  } = useAsync();
  const {
    data: shopHeightsRes,
    status: shopHeightStatus,
    run: runShopHeight,
  } = useAsync();
  const {
    data: strapiProductsRes,
    status: strapiProductStatus,
    run: runStrapiProduct,
  } = useAsync();
  const {
    data: shopifyProductData,
    status: shopifyProductStatus,
    run: runShopifyProduct,
  } = useAsync();
  const { data: pressRes, status: pressStatus, run: runPress } = useAsync();
  const {
    data: settingsRes,
    status: settingsStatus,
    run: runSettings,
  } = useAsync();

  useEffect(() => {
    if (shopHeightsRes) {
      setShopHeightsRoot(shopHeightsRes.data);
    }
  }, [shopHeightsRes]);

  useEffect(() => {
    if (!initialDataFetchInvoked) {
      console.log('FETCHING INITIAL DATA...');
      setInitialDataFetchInvoked(true);

      runImages(authFetch.get(strapiEndpoints.images));
      runUpload(authFetch.get(strapiEndpoints.uploads));
      runPortfolio(authFetch.get(strapiEndpoints.portfolioPages));
      runShopHeight(authFetch.get(strapiEndpoints.shopHeights));
      runStrapiProduct(authFetch.get(strapiEndpoints.products));
      const shopifyClient = Client.buildClient({
        storefrontAccessToken: 'aec2e7a9ff50e738535be4a359037f1f',
        domain: 'amy-jewellery-x.myshopify.com',
      });
      runShopifyProduct(shopifyClient.product.fetchAll(250));
      runPress(authFetch.get(strapiEndpoints.pressElements));
      runSettings(authFetch.get(strapiEndpoints.settings));
    }
  }, [
    authFetch,
    initialDataFetchInvoked,
    runImages,
    runPortfolio,
    runPress,
    runShopHeight,
    runShopifyProduct,
    runStrapiProduct,
    runUpload,
    strapiEndpoints.images,
    strapiEndpoints.portfolioPages,
    strapiEndpoints.pressElements,
    strapiEndpoints.products,
    strapiEndpoints.shopHeights,
    strapiEndpoints.uploads,
    strapiEndpoints.settings,
    runSettings,
  ]);

  useEffect(() => {
    if (portfolioFetchToggle) {
      console.log('FETCHING PORTFOLIO DATA');
      setPortfolioFetchToggle(false);
      runPortfolio(authFetch.get(strapiEndpoints.portfolioPages));
    }
  }, [
    authFetch,
    portfolioFetchToggle,
    runPortfolio,
    strapiEndpoints.portfolioPages,
  ]);

  useEffect(() => {
    if (settingsRes) {
      setSettingsRoot(settingsRes.data);
    }
  }, [settingsRes]);

  useEffect(() => {
    if (portfolioRes && !portfolioProcessingInvoked) {
      async function processPortfolio() {
        console.log('PROCESSING PORTFOLIO...');
        setPortfolioProcessingInvoked(true);

        try {
          // process data
          const portfolioData = portfolioRes.data;
          const portfolioProcessed = produce(portfolioData, (draft) => {
            draft.forEach((page) => {
              removeInvalidImageComponentsAndFlagElementIfUpdated(
                page,
                'imageComponents'
              );

              sortComponentsAndFlagIfUpdated(page.imageComponents, page);
            });

            const emptyPages = draft.filter((page) => !page.imageComponents[0]);
            emptyPages.forEach((page) => {
              deleteComponentFromParent(page, draft);
            });

            sortComponentsAndFlagIfUpdated(draft);
          });
          setPortfolioRoot(portfolioProcessed);

          // make api calls
          const portfolioProcessedIds = portfolioProcessed.map(
            (page) => page.id
          );
          const emptyPages = portfolioData.filter(
            (page) => !portfolioProcessedIds.includes(page.id)
          );
          const updatedPages = portfolioProcessed.filter(
            (page) => page.updated
          );
          axios.all(
            [
              emptyPages.map((page) =>
                authFetch.delete(`${strapiEndpoints.portfolioPages}/${page.id}`)
              ),
              updatedPages.map((page) =>
                authFetch.put(
                  `${strapiEndpoints.portfolioPages}/${page.id}`,
                  page
                )
              ),
            ].flat()
          );
        } catch (error) {
          console.log(
            '🚀 ~ file: DataContext.js ~ line 219 ~ processPortfolio ~ error',
            error
          );
        }
      }

      processPortfolio();
    }
  }, [
    authFetch,
    portfolioProcessingInvoked,
    portfolioRes,
    strapiEndpoints.portfolioPages,
  ]);

  useEffect(() => {
    if (
      strapiProductsRes &&
      shopifyProductData &&
      !strapiProductProcessingInvoked
    ) {
      async function removeUnusedStrapiProducts() {
        console.log('PROCESSING STRAPI PRODUCTS...');
        setStrapiProductProcessingInvoked(true);
        try {
          const strapiProductData = strapiProductsRes.data;

          // process data
          const usedStrapiProducts = filterStrapiProducts(
            'used',
            strapiProductData,
            shopifyProductData
          );
          const strapiProductsProcessed = produce(
            usedStrapiProducts,
            (draft) => {
              draft.forEach((product) => {
                removeInvalidImageComponentsAndFlagElementIfUpdated(
                  product,
                  'images'
                );
              });
            }
          );

          setStrapiProductsRoot(strapiProductsProcessed);

          // api calls
          const unusedStrapiProducts = filterStrapiProducts(
            'unused',
            strapiProductData,
            shopifyProductData
          );
          const updatedStrapiProducts = strapiProductsProcessed.filter(
            (product) => product.updated
          );
          axios.all(
            [
              unusedStrapiProducts.map((product) =>
                authFetch.delete(`${strapiEndpoints.products}/${product.id}`)
              ),
              updatedStrapiProducts.map((product) =>
                authFetch.put(
                  `${strapiEndpoints.products}/${product.id}`,
                  product
                )
              ),
            ].flat()
          );
        } catch (error) {
          console.log(
            '🚀 ~ file: DataContext.js ~ line 213 ~ removeUnusedStrapiProducts ~ error',
            error
          );
        }
      }

      removeUnusedStrapiProducts();
    }
  }, [
    strapiProductsRes,
    shopifyProductData,
    strapiProductProcessingInvoked,
    authFetch,
    strapiEndpoints.products,
  ]);

  useEffect(() => {
    if (pressRes && !pressProcessingInvoked) {
      async function processPress() {
        console.log('PROCESSING PRESS...');
        setPressProcessingInvoked(true);

        try {
          const pressData = pressRes.data;
          const pressProcessed = produce(pressData, (draft) => {
            sortComponentsAndFlagIfUpdated(draft);
          });
          setPressElementsRoot(pressProcessed);

          const updatedElements = pressProcessed.filter(
            (element) => element.updated
          );
          axios.all(
            updatedElements.map((element) =>
              authFetch.put(`${strapiEndpoints.pressElements}/${element.id}`)
            )
          );
        } catch (error) {
          console.log(
            '🚀 ~ file: DataContext.js ~ line 277 ~ processPress ~ error',
            error
          );
        }
      }

      processPress();
    }
  }, [
    authFetch,
    pressProcessingInvoked,
    pressRes,
    strapiEndpoints.pressElements,
  ]);

  useEffect(() => {
    if (
      imagesRes &&
      uploadRes &&
      portfolioRes &&
      strapiProductsRes &&
      shopifyProductData &&
      pressRes &&
      !uploadAndImageProcessingInvoked
    ) {
      async function processImagesAndUploads() {
        console.log('PROCESSING IMAGES AND UPLOADS...');
        setUploadAndImageProcessingInvoked(true);
        try {
          // remove unused images
          const validPortfolioImages = portfolioRes.data
            .map((page) => page.imageComponents)
            .flat()
            .filter((imageComponent) => imageComponent?.image?.image?.url);
          const usedStrapiProducts = filterStrapiProducts(
            'used',
            strapiProductsRes.data,
            shopifyProductData
          );
          const validProductImages = usedStrapiProducts
            .map((product) => product.images)
            .flat()
            .filter((imageComponent) => imageComponent?.image?.image?.url);
          const validPressImages = pressRes.data
            .map((element) => element.image)
            .filter((image) => image?.image?.url);

          const usedValidUniqueImageIds = [
            ...new Set([
              ...validPortfolioImages.map(
                (imageComponent) => imageComponent.image.id
              ),
              ...validProductImages.map(
                (imageComponent) => imageComponent.image.id
              ),
              ...validPressImages.map((image) => image.id),
            ]),
          ];
          const usedValidUniqueUploadIds = [
            ...new Set([
              ...validPortfolioImages.map(
                (imageComponent) => imageComponent.image.image.id
              ),
              ...validProductImages.map(
                (imageComponent) => imageComponent.image.image.id
              ),
              ...validPressImages.map((image) => image.image.id),
            ]),
          ];

          const imageData = imagesRes.data;
          const allImageIds = imageData.map((image) => image.id);

          const unUsedAndInvalidImageIds = allImageIds.filter(
            (imageId) => !usedValidUniqueImageIds.includes(imageId)
          );

          const allUploadIds = uploadRes.data.map((upload) => upload.id);

          const unUsedAndInvalidUploadIds = allUploadIds.filter(
            (uploadId) => !usedValidUniqueUploadIds.includes(uploadId)
          );

          const allUsedImages = imageData.filter((image) =>
            usedValidUniqueImageIds.includes(image.id)
          );
          setImagesRoot(allUsedImages);

          // make api calls

          axios.all(
            [
              unUsedAndInvalidImageIds.map((imageId) =>
                authFetch.delete(`${strapiEndpoints.images}/${imageId}`)
              ),
              unUsedAndInvalidUploadIds.map((uploadId) =>
                authFetch.delete(`${strapiEndpoints.uploads}/${uploadId}`)
              ),
            ].flat()
          );
        } catch (error) {
          console.log(
            '🚀 ~ file: DataContext.js ~ line 371 ~ processImagesAndUploads ~ error',
            error
          );
        }
      }

      processImagesAndUploads();
    }
  }, [
    authFetch,
    imagesRes,
    portfolioRes,
    pressRes,
    shopifyProductData,
    strapiEndpoints.images,
    strapiEndpoints.uploads,
    strapiProductsRes,
    strapiProductsRoot,
    uploadAndImageProcessingInvoked,
    uploadRes,
  ]);

  const value = {
    imagesRoot,
    portfolioStatus,
    portfolioRoot,
    setPortfolioRoot,
    fetchPortfolio: () => setPortfolioFetchToggle(true),
    portfolioComplete,
    setPortfolioComplete: () => setPortfolioComplete(true),
    shopHeightsRoot,
    setShopHeightsRoot,
    strapiProductsRoot,
    setStrapiProductsRoot,
    shopifyProductData,
    pressElementsRoot,
    setPressElementsRoot,
    settingsRoot,
    setSettingsRoot,
  };

  return <Provider value={value}>{children}</Provider>;
}

function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within the DataProvider');

  return context;
}

export { DataProvider, useData };
