import { useState, useContext, createContext, useEffect } from 'react';
import Client from 'shopify-buy';
import produce from 'immer';
import axios from 'axios';

import { useFetch } from './FetchContext';
import useAsync from '../hooks/useAsync';

import { filterArr1WithArr2, sortByAscending } from '../utils';
import { applyCorrectValueAndFlag } from '../utils/processData';
import { filterDuplicateComponents } from '../utils';

const DataContext = createContext();
const { Provider } = DataContext;

/* NOTES (to keep)
  - positions/widths etc. don't need to be sorted as they are handled when selected (by selectStyleDataForDevice)
*/

function DataProvider({ children }) {
  const [portfolioRoot, setPortfolioRoot] = useState(null);
  const [strapiProductsRoot, setStrapiProductsRoot] = useState(null);
  const [shopHeightsRoot, setShopHeightsRoot] = useState(null);
  const [pressRoot, setPressRoot] = useState(null);
  const [pressPerRowRoot, setPressPerRowRoot] = useState(null);
  const [settingsRoot, setSettingsRoot] = useState(null);
  const [imagesRoot, setImagesRoot] = useState(null);
  const [cleanDbToggle, setCleanDbToggle] = useState(true);

  const { authFetch, strapiEndpoints } = useFetch();

  const {
    res: portfolioRes,
    status: portfolioFetchStatus,
    run: runPortfolioFetch,
    reset: resetPortfolioFetch,
  } = useAsync();

  const {
    res: strapiProductsRes,
    status: strapiProductsFetchStatus,
    run: runStrapiProductsFetch,
    reset: resetStrapiProductsFetch,
  } = useAsync();

  const {
    res: shopifyProductsData,
    status: shopifyProductsFetchStatus,
    run: runShopifyProductsFetch,
    reset: resetShopifyProductsFetch,
  } = useAsync();

  const {
    status: shopHeightsFetchStatus,
    run: runShopHeightsFetch,
    reset: resetShopHeightsFetch,
  } = useAsync();

  const {
    status: pressFetchStatus,
    run: runPressFetch,
    reset: resetPressFetch,
  } = useAsync();

  const {
    status: pressPerRowFetchStatus,
    run: runPressPerRowFetch,
    reset: resetPressPerRowFetch,
  } = useAsync();

  const {
    res: imagesRes,
    status: imagesFetchStatus,
    run: runImagesFetch,
    reset: resetImagesFetch,
  } = useAsync();

  const {
    status: settingsFetchStatus,
    run: runSettingsFetch,
    reset: resetSettingsFetch,
  } = useAsync();

  const {
    res: uploadsRes,
    status: uploadsFetchStatus,
    run: runUploadsFetch,
  } = useAsync();

  useEffect(() => {
    if (portfolioFetchStatus === 'idle') {
      const processData = (res) => {
        const processedData = produce(res.data, (draft) => {
          sortByAscending(draft, 'order');

          draft.forEach((page, i) => {
            applyCorrectValueAndFlag(page, 'order', i);

            const validImgComponents = page.imageComponents.filter(
              (imgComponent) => {
                const validImgComponent = imgComponent?.image?.image?.url;
                if (!validImgComponent) {
                  page.updated = true;
                }
                return validImgComponent;
              }
            );
            sortByAscending(validImgComponents, 'layer');
            validImgComponents.forEach((imgComponent, i) =>
              applyCorrectValueAndFlag(imgComponent, 'layer', i, page)
            );
            sortByAscending(validImgComponents, 'order');
            validImgComponents.forEach((imgComponent, i) =>
              applyCorrectValueAndFlag(imgComponent, 'order', i, page)
            );
            page.imageComponents = validImgComponents;
          });
        });
        const nonEmptyPages = processedData.filter(
          (page) => page.imageComponents[0]
        );

        setPortfolioRoot(nonEmptyPages);
      };

      runPortfolioFetch(authFetch.get(strapiEndpoints.portfolio), processData);
    }
  }, [
    authFetch,
    portfolioFetchStatus,
    runPortfolioFetch,
    strapiEndpoints.portfolio,
  ]);

  useEffect(() => {
    if (strapiProductsFetchStatus === 'idle') {
      const processData = (res) => {
        const processedData = produce(res.data, (draft) => {
          draft.forEach((product) => {
            const validImgComponents = product.images.filter((imgComponent) => {
              const validImgComponent = imgComponent?.image?.image?.url;
              if (!validImgComponent) {
                product.updated = true;
              }
              return validImgComponent;
            });
            product.images = validImgComponents;
          });

          return draft;
        });
        setStrapiProductsRoot(processedData);
      };
      runStrapiProductsFetch(
        authFetch.get(strapiEndpoints.products),
        processData
      );
    }
  }, [
    authFetch,
    strapiProductsFetchStatus,
    runStrapiProductsFetch,
    strapiEndpoints.products,
  ]);

  useEffect(() => {
    if (shopifyProductsFetchStatus === 'idle') {
      const shopifyClient = Client.buildClient({
        storefrontAccessToken: 'aec2e7a9ff50e738535be4a359037f1f',
        domain: 'amy-jewellery-x.myshopify.com',
      });

      runShopifyProductsFetch(shopifyClient.product.fetchAll(250));
    }
  }, [runShopifyProductsFetch, shopifyProductsFetchStatus]);

  useEffect(() => {
    if (shopHeightsFetchStatus === 'idle') {
      const processData = (res) => setShopHeightsRoot(res.data);

      runShopHeightsFetch(
        authFetch.get(strapiEndpoints.shopHeights),
        processData
      );
    }
  }, [
    authFetch,
    runShopHeightsFetch,
    shopHeightsFetchStatus,
    strapiEndpoints.shopHeights,
  ]);

  useEffect(() => {
    if (pressFetchStatus === 'idle') {
      const processData = (res) => {
        const processedData = produce(res.data, (draft) => {
          sortByAscending(draft, 'order');
          draft.forEach((element, i) => {
            applyCorrectValueAndFlag(element, 'order', i);

            const image = element.image;
            const validImage = element?.image?.image?.url;
            if (image && !validImage) {
              element.image = null;
              element.updated = true;
            }
          });
        });
        setPressRoot(processedData);
      };

      runPressFetch(authFetch.get(strapiEndpoints.press), processData);
    }
  }, [authFetch, pressFetchStatus, runPressFetch, strapiEndpoints.press]);

  useEffect(() => {
    if (pressPerRowFetchStatus === 'idle') {
      const processData = (res) => setPressPerRowRoot(res.data);

      runPressPerRowFetch(
        authFetch.get(strapiEndpoints.pressElementsPerRow),
        processData
      );
    }
  }, [
    authFetch,
    pressPerRowFetchStatus,
    runPressPerRowFetch,
    strapiEndpoints.pressElementsPerRow,
  ]);

  useEffect(() => {
    if (settingsFetchStatus === 'idle') {
      const processData = (res) => setSettingsRoot(res.data);

      runSettingsFetch(authFetch.get(strapiEndpoints.settings), processData);
    }
  }, [
    authFetch,
    runSettingsFetch,
    settingsFetchStatus,
    strapiEndpoints.settings,
  ]);

  useEffect(() => {
    if (imagesFetchStatus === 'idle') {
      runImagesFetch(authFetch.get(strapiEndpoints.images));
    }
  }, [authFetch, imagesFetchStatus, runImagesFetch, strapiEndpoints.images]);

  useEffect(() => {
    if (uploadsFetchStatus === 'idle') {
      runUploadsFetch(authFetch.get(strapiEndpoints.uploads));
    }
  }, [authFetch, runUploadsFetch, strapiEndpoints.uploads, uploadsFetchStatus]);

  useEffect(() => {
    if (portfolioRoot && strapiProductsRoot && pressRoot) {
      // images validity checked in respective content section above
      const portfolioImages = portfolioRoot
        .map((page) =>
          page.imageComponents.map((imgComponent) => imgComponent.image)
        )
        .flat();
      const productImages = strapiProductsRoot
        .map((product) =>
          product.images.map((imgComponent) => imgComponent.image)
        )
        .flat();
      const pressImages = pressRoot
        .filter((element) => element.image)
        .map((element) => element.image);
      const usedImages = [portfolioImages, productImages, pressImages].flat();

      setImagesRoot(filterDuplicateComponents(usedImages));
    }
  }, [portfolioRoot, pressRoot, strapiProductsRoot]);

  useEffect(() => {
    // CLEAN UP DATABASE
    if (
      cleanDbToggle &&
      imagesRoot &&
      portfolioRoot &&
      shopifyProductsData &&
      strapiProductsRoot &&
      pressRoot &&
      uploadsRes
    ) {
      setCleanDbToggle(false);

      const unusedPortfPages = filterArr1WithArr2(
        portfolioRes.data,
        portfolioRoot,
        'excludes'
      );
      const unusedStrapiProducts = filterArr1WithArr2(
        strapiProductsRes.data,
        shopifyProductsData,
        'excludes',
        'shopifyId'
      );
      const unusedImages = filterArr1WithArr2(
        imagesRes.data,
        imagesRoot,
        'excludes'
      );
      const unusedUploads = filterArr1WithArr2(
        uploadsRes.data,
        imagesRoot.map((image) => image.image)
      );

      axios.all(
        [
          unusedPortfPages.map((page) =>
            authFetch.delete(`${strapiEndpoints.portfolio}/${page.id}`)
          ),
          unusedStrapiProducts.map((product) =>
            authFetch.delete(`${strapiEndpoints.products}/${product.id}`)
          ),
          unusedImages.map((image) =>
            authFetch.delete(`${strapiEndpoints.images}/${image.id}`)
          ),
          unusedUploads.map((upload) =>
            authFetch.delete(`${strapiEndpoints.uploads}/${upload.id}`)
          ),
        ].flat()
      );
    }
  }, [
    authFetch,
    cleanDbToggle,
    imagesRes,
    imagesRoot,
    portfolioRes,
    portfolioRoot,
    pressRoot,
    shopifyProductsData,
    strapiEndpoints,
    strapiProductsRes,
    strapiProductsRoot,
    uploadsRes,
  ]);

  const value = {
    portfolioRoot: {
      data: portfolioRoot,
      setData: setPortfolioRoot,
      fetchStatus: portfolioFetchStatus,
      resetFetch: resetPortfolioFetch,
    },
    strapiProductsRoot: {
      data: strapiProductsRoot,
      setData: setStrapiProductsRoot,
      fetchStatus: strapiProductsFetchStatus,
      resetFetch: resetStrapiProductsFetch,
    },
    shopifyProducts: {
      data: shopifyProductsData,
      fetchStatus: shopifyProductsFetchStatus,
      resetFetch: resetShopifyProductsFetch,
    },
    shopHeightsRoot: {
      data: shopHeightsRoot,
      setData: setShopHeightsRoot,
      fetchStatus: shopHeightsFetchStatus,
      resetFetch: resetShopHeightsFetch,
    },
    pressRoot: {
      data: pressRoot,
      setData: setPressRoot,
      fetchStatus: pressFetchStatus,
      resetFetch: resetPressFetch,
    },
    pressPerRowRoot: {
      data: pressPerRowRoot,
      setData: setPressPerRowRoot,
      fetchStatus: pressPerRowFetchStatus,
      resetFetch: resetPressPerRowFetch,
    },
    settingsRoot: {
      data: settingsRoot,
      setData: setSettingsRoot,
      fetchStatus: settingsFetchStatus,
      resetFetch: resetSettingsFetch,
    },
    imagesRoot: {
      data: imagesRoot,
      fetchStatus: imagesFetchStatus,
      resetFetch: resetImagesFetch,
    },
  };

  return <Provider value={value}>{children}</Provider>;
}

function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within the DataProvider');

  return context;
}

export { DataProvider, useData };
