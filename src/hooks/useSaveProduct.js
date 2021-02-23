import produce from 'immer';
import { useLayoutEffect } from 'react';

import { useData } from '../context/DataContext';
import { useDeploy } from '../context/DeployContext';
import { useFetch } from '../context/FetchContext';
// import { removeTemporaryFieldsFromNewImageComponents } from '../utils';
import useAsync from './useAsync';

function useSaveProduct(setUnsavedChange) {
  const { data, status, run, reset } = useAsync();
  const { authFetch } = useFetch();
  const { setStrapiProducts: setStrapiProductsRoot } = useData();
  const { setUndeployedSave } = useDeploy();

  useLayoutEffect(() => {
    if (status === 'resolved') {
      console.log(data);
      setStrapiProductsRoot(
        produce((draft) => {
          const updatedProduct = data.data;
          const draftProductIndex = draft.findIndex(
            (draftProduct) => draftProduct.id === updatedProduct.id
          );
          draft.splice(draftProductIndex, 1, updatedProduct);
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

  function save(dataModified) {
    // const updatedProductProcessed = produce(dataModified, (draft) => {
    //   draft.images = removeTemporaryFieldsFromNewImageComponents(draft.images);
    // });
    // run(authFetch.put(`products/${dataModified.id}`, updatedProductProcessed));
  }

  return { save, status };
}

export default useSaveProduct;
