import produce from 'immer';
import { useLayoutEffect } from 'react';

import { useData } from '../context/DataContext';
import { useDeploy } from '../context/DeployContext';
import { useFetch } from '../context/FetchContext';
import useAsync from './useAsync';

function useSavePortfolioPage(pageId, setUnsavedChange) {
  const { portfolio, setPortfolio } = useData();
  const { authFetch } = useFetch();
  const { data, status, run, reset } = useAsync();
  const {
    status: deployStatus,
    setUndeployedSave,
    savedDuringDeployString,
  } = useDeploy();

  useLayoutEffect(() => {
    if (status === 'resolved') {
      const savedPage = data.data;
      setPortfolio(
        produce((draft) => {
          const pageIndex = draft.findIndex((page) => page.id === savedPage.id);
          draft.splice(pageIndex, 1, savedPage);
        })
      );

      setUndeployedSave(
        deployStatus === 'pending' ? savedDuringDeployString : true
      );
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

  function save(imageComponents) {
    console.log('SAVING PORFTFOLIO PAGE...');
    const imageComponentsTempFieldsRemoved = produce(imageComponents, (draft) =>
      draft.forEach((component) => {
        if (component.new) {
          delete component.new;
          delete component.id;
        }
      })
    );
    const pageData = portfolio.find((page) => page.id === pageId);
    const updatedPage = produce(pageData, (draft) => {
      draft.imageComponents = imageComponentsTempFieldsRemoved;
    });

    run(authFetch.put(`portfolio-pages/${pageId}`, updatedPage));
  }

  return { save, status };
}

export default useSavePortfolioPage;
