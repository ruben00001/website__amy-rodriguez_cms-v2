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

const DataContext = createContext();
const { Provider } = DataContext;

// api calls should be in useeffect as are side effects!
function DataProvider({ children }) {
  const [images, setImages] = useState(null);
  const [defaultProduct, setDefaultProduct] = useState(null);
  const [shopHeight, setShopHeight] = useState(null);
  const [shopifyProducts, setShopifyProducts] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [strapiProducts, setStrapiProducts] = useState(null);
  const [status, setStatus] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const { authFetch } = useFetch();

  useEffect(() => {
    if (triggerFetch && !status) {
      async function fetchAndCleanAllDataAndRemoveInvalidDataFromDatabase() {
        console.log('FETCHING INITIAL DATA...');
        setStatus('pending');

        try {
          // FETCH DATA
          const strapiEndpoints = [
            'portfolio-pages',
            'products',
            'shop-home-heights',
            'default-product',
            'images',
            'upload/files',
          ];
          const limitParameter = '?_limit=1000000';
          const strapiResponse = await axios.all(
            strapiEndpoints.map((endPoint) =>
              authFetch.get(endPoint + limitParameter)
            )
          );
          const [
            portfolio,
            strapiProducts,
            shopHeight,
            defaultProduct,
            allImages,
            uploads,
          ] = strapiResponse.map((response) => response.data);

          setShopHeight(shopHeight);
          setDefaultProduct(defaultProduct);

          const shopifyProducts = await fetchShopifyProducts();
          setShopifyProducts(shopifyProducts);

          // HANDLE INVALID PRODUCTS

          const unusedStrapiProducts = strapiProducts.filter(
            (strapiProduct) =>
              !shopifyProducts.find(
                (shopifyProduct) =>
                  shopifyProduct.id === strapiProduct.shopifyId
              )
          );

          await axios.all(
            unusedStrapiProducts.map((product) =>
              authFetch.delete(`products/${product.id}`)
            )
          );

          // HANDLE UNUSED IMAGES
          const portfolioImageIds = portfolio
            .map((page) =>
              page.imageComponents.map(
                (imageComponent) => imageComponent.image.id
              )
            )
            .flat();

          const usedStrapiProducts = strapiProducts.filter((strapiProduct) =>
            shopifyProducts.find(
              (shopifyProduct) => shopifyProduct.id === strapiProduct.shopifyId
            )
          );
          const productImageIds = usedStrapiProducts
            .map((product) =>
              product.images.map((imageComponent) => imageComponent.image.id)
            )
            .flat();
          const usedImageIds = [
            ...new Set([...portfolioImageIds, ...productImageIds]),
          ];
          const unusedImages = allImages.filter(
            (image) => !usedImageIds.includes(image.id)
          );

          await axios.all(
            unusedImages.map((image) => authFetch.delete(`images/${image.id}`))
          );

          // HANDLE UNUSED UPLOADS

          const portfolioUploadIds = portfolio
            .map((page) =>
              page.imageComponents.map(
                (imageComponent) => imageComponent.image.image.id
              )
            )
            .flat();

          const productUploadIds = usedStrapiProducts
            .map((product) =>
              product.images.map(
                (imageComponent) => imageComponent.image.image.id
              )
            )
            .flat();

          const usedUploadIds = [
            ...new Set([...portfolioUploadIds, ...productUploadIds]),
          ];

          const unusedUploads = uploads.filter(
            (upload) => !usedUploadIds.includes(upload.id)
          );

          await axios.all(
            unusedUploads.map((upload) =>
              authFetch.delete(`upload/files/${upload.id}`)
            )
          );

          // REMOVE INVALID UPLOADS FROM USED UPLOADS
          const usedUploads = uploads.filter((upload) =>
            usedUploadIds.includes(upload.id)
          );
          const invalidUploads = usedUploads.filter((upload) => !upload.url);

          await axios.all(
            invalidUploads.map((upload) =>
              authFetch.delete(`upload/files/${upload.id}`)
            )
          );

          // REMOVE INVALID IMAGES FROM USED IMAGES
          const usedImages = allImages.filter((image) =>
            usedImageIds.includes(image.id)
          );
          const invalidImages = usedImages.filter((image) => !image.image);
          const validImages = usedImages.filter((image) => image.image);

          setImages(validImages);

          await axios.all(
            invalidImages.map((image) => authFetch.delete(`images/${image.id}`))
          );

          // FETCH PORTFOLIO AND PRODUCTS AGAIN
          const newStrapiResponse = await axios.all([
            authFetch.get('portfolio-pages'),
            authFetch.get('products'),
          ]);
          const [
            portfolioWithInvalidImagesRemoved,
            cleanProducts,
          ] = newStrapiResponse.map((res) => res.data);

          setStrapiProducts(cleanProducts);

          // REMOVE UNUSED PORTFOLIO PAGES
          const unusedPortfolioPages = portfolioWithInvalidImagesRemoved.filter(
            (page) => !page.imageComponents[0]
          );

          await axios.all(
            unusedPortfolioPages.map((page) =>
              authFetch.delete(`portfolio-pages/${page.id}`)
            )
          );

          // REORDER PORTFOLIO PAGES
          const usedPortfolioPages = portfolioWithInvalidImagesRemoved.filter(
            (page) => page.imageComponents[0]
          );

          const portfolioReordered = produce(usedPortfolioPages, (draft) => {
            draft.sort((a, b) => a.order - b.order);
            draft.forEach((page, i) => {
              if (page.order !== i + 1) {
                page.order = i + 1;
                page.changed = true;
              }
            });
          });
          const reorderedPages = portfolioReordered.filter(
            (page) => page.changed
          );
          console.log(
            '🚀 ~ file: DataContext.js ~ line 205 ~ fetchAndCleanAllDataAndRemoveInvalidDataFromDatabase ~ reorderedPages',
            reorderedPages
          );

          await axios.all(
            reorderedPages.map((page) =>
              authFetch.put(`portfolio-pages/${page.id}`, page)
            )
          );

          setPortfolio(portfolioReordered);

          setStatus('resolved');
          setTimeout(() => {
            setStatus('complete');
          }, 800);
        } catch (error) {
          // should be able to differentiate between errors and allow app to work in sections where possible
          setStatus('rejected');
        }
      }
      fetchAndCleanAllDataAndRemoveInvalidDataFromDatabase();
    }
  }, [triggerFetch, status, authFetch]);

  async function fetchShopifyProducts() {
    const shopifyClient = Client.buildClient({
      storefrontAccessToken: 'aec2e7a9ff50e738535be4a359037f1f',
      domain: 'amy-jewellery-x.myshopify.com',
    });

    return await shopifyClient.product.fetchAll(250);
  }

  const value = {
    images,
    portfolio,
    strapiProducts,
    shopifyProducts,
    shopHeight,
    defaultProduct,
    status,
    fetchData: () => setTriggerFetch(true),
    setDefaultProduct,
    setShopHeight,
    setShopifyProducts,
    setPortfolio,
    setStrapiProducts,
  };

  return <Provider value={value}>{children}</Provider>;
}

function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within the DataProvider');

  const { status, fetchData } = context;

  useLayoutEffect(() => {
    if (!status) {
      fetchData();
    }
  }, [status, fetchData]);

  return context;
}

export { DataProvider, useData };
