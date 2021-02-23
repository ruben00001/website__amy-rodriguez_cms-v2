import axios from 'axios';
import produce from 'immer';
import { useLayoutEffect } from 'react';

import { useData } from '../context/DataContext';
import { useDeploy } from '../context/DeployContext';
import { useFetch } from '../context/FetchContext';
// import { removeTemporaryFieldsFromNewImageComponents as removeTempFieldsFromNewComponents } from '../utils';
import useAsync from './useAsync';

function useSavePress(setUnsavedChange) {
  const { data, status, run, reset } = useAsync();
  const { authFetch } = useFetch();
  const {
    pressElements: pressElementsRoot,
    setPressElements: setPressElementsRoot,
  } = useData();
  const { setUndeployedSave } = useDeploy();

  useLayoutEffect(() => {
    if (status === 'resolved') {
      console.log(data);
      const postResponses = data.filter(
        (response) => response.config.method === 'post'
      );
      const putResponses = data.filter(
        (response) => response.config.method === 'put'
      );
      setPressElementsRoot(produce((draft) => {}));

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

  function save(pressElementsModified) {
    const newElements = pressElementsModified.filter((element) => element.new);
    // const newElementsProcessed = removeTempFieldsFromNewComponents(newElements);

    const updatedElements = pressElementsModified.filter((element) => {
      // need to get reordered pages too
      return element.updated;
    });
    const pressElementsModifiedIds = pressElementsModified.map(
      (element) => element.id
    );
    const deletedElements = pressElementsRoot.filter(
      (rootElement) => !pressElementsModifiedIds.includes(rootElement.id)
    );

    // run(
    //   axios.all(
    //     [
    //       newElementsProcessed.map((element) =>
    //         authFetch.post('press-elements', element)
    //       ),
    //       updatedElements.map((element) =>
    //         authFetch.put(`press-elements/${element.id}`, element)
    //       ),
    //     ].flat()
    //   )
    // );
  }

  return { save, status };
}

export default useSavePress;
