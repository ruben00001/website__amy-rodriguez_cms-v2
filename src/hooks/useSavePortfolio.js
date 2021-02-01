import axios from 'axios';
import produce from 'immer';
import { useLayoutEffect } from 'react';

import { useData } from '../context/DataContext';
import { useDeploy } from '../context/DeployContext';
import { useFetch } from '../context/FetchContext';
import { sortByAscendingOrder } from '../utils';
import useAsync from './useAsync';

function useSavePortfolio(setUnsavedChange) {
  const {
    portfolio: portfolioDataRoot,
    setPortfolio: setPortfolioDataRoot,
  } = useData();
  const { authFetch } = useFetch();
  const { data, status, run, reset } = useAsync();
  const { setUndeployedSave } = useDeploy();

  useLayoutEffect(() => {
    if (status === 'resolved') {
      const deletedPageIds = data
        .filter((item) => item.config.method === 'delete')
        .map((item) => item.data.id);
      const updatedPages = data
        .filter((item) => item.config.method === 'put')
        .map((item) => item.data);
      const newPages = data
        .filter((item) => item.config.method === 'post')
        .map((item) => item.data);

      setPortfolioDataRoot(
        produce((draft) => {
          deletedPageIds.forEach((deletedPageId) => {
            const pageToDeleteIndex = draft.findIndex(
              (page) => page.id === deletedPageId
            );
            draft.splice(pageToDeleteIndex, 1);
          });
          updatedPages.forEach((updatedPage) => {
            const pageToUpdateIndex = draft.findIndex(
              (page) => page.id === updatedPage.id
            );
            draft.splice(pageToUpdateIndex, 1, updatedPage);
          });
          newPages.forEach((newPage) => {
            draft.push(newPage);
          });
          draft.sort(sortByAscendingOrder);
        })
      );

      setUndeployedSave(true);
      setTimeout(() => {
        setUnsavedChange(false);
        reset();
      }, 500);
    }
    if (status === 'rejected') {
      setTimeout(() => {
        reset();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function save(portfolioDataModified) {
    console.log('SAVING PORTFOLIO...');
    // FIRST, FIND PAGES TO UPDATE, CREATE AND DELETE
    const reorderedPagesExcludingNewPages = portfolioDataModified.filter(
      (page, i) => page.order !== i + 1 && !page.new
    );
    const reorderedPagesWithUpdatedOrder = produce(
      reorderedPagesExcludingNewPages,
      (draft) =>
        draft.forEach((reorderedPage) => {
          const updatedOrder =
            portfolioDataModified.findIndex(
              (page) => page.id === reorderedPage.id
            ) + 1;
          reorderedPage.order = updatedOrder;
        })
    );

    const newPages = portfolioDataModified.filter((page) => page.new);
    const newPagesWithUpdatedOrderAndTempFieldsRemoved = produce(
      newPages,
      (draft) => {
        draft.forEach((newPage) => {
          const order =
            portfolioDataModified.findIndex((page) => page.id === newPage.id) +
            1;
          newPage.order = order;
          delete newPage.id;
          delete newPage.new;
        });
      }
    );

    const modifiedPortfolioIds = portfolioDataModified.map((page) => page.id);
    const deletedPages = portfolioDataRoot.filter(
      (rootPage) => !modifiedPortfolioIds.includes(rootPage.id)
    );

    run(
      axios.all(
        [
          reorderedPagesWithUpdatedOrder.map((page) =>
            authFetch.put(`portfolio-pages/${page.id}`, page)
          ),
          newPagesWithUpdatedOrderAndTempFieldsRemoved.map((page) =>
            authFetch.post(`portfolio-pages`, page)
          ),
          deletedPages.map((page) =>
            authFetch.delete(`portfolio-pages/${page.id}`)
          ),
        ].flat()
      )
    );
  }

  return { save, status };
}

export default useSavePortfolio;
