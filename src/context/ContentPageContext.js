import axios from 'axios';
import React, { createContext, useState } from 'react';
import { useContext } from 'react';
import useAsync from '../hooks/useAsync';
import useDevice from '../hooks/useDevice';
import usePageDimensions from '../hooks/usePageDimensions';
import { useDeploy } from './DeployContext';
import { useFetch } from './FetchContext';

const ContentPageContext = createContext();
const { Provider } = ContentPageContext;

const ContentPageProvider = ({ children, page }) => {
  const [unsavedChange, setUnsavedChange] = useState(false);
  const [controlPanelHeight, setControlPanelHeight] = useState(null);

  const { device, setDevice } = useDevice();

  const {
    bodyWidth,
    singleScreenBodyHeight,
    canvasWidth,
    singleScreenCanvasHeight,
  } = usePageDimensions({
    controlPanelHeight,
    device,
  });

  const {
    isActive: saveIsActive,
    status: saveStatus,
    run: runSave,
  } = useAsync();

  const { setUndeployedSave } = useDeploy();
  const { mapFetches } = useFetch();

  function handleSave(fetchArray, handleSaveResponse) {
    runSave(axios.all(fetchArray.flat()), (res) => {
      handleSaveResponse(res);
      setUnsavedChange(false);
      setUndeployedSave(true);
    });
  }

  return (
    <Provider
      value={{
        page,
        unsavedChange,
        setUnsavedChange,
        controlPanelHeight,
        setControlPanelHeight,
        device,
        setDevice,
        saveIsActive,
        saveStatus,
        handleSave,
        mapFetches,
        bodyWidth,
        singleScreenBodyHeight,
        canvasWidth,
        singleScreenCanvasHeight,
      }}
    >
      {children}
    </Provider>
  );
};

function useContentPage() {
  const context = useContext(ContentPageContext);
  if (!context)
    throw new Error(
      'useContentPage must be used within the ContentPageProvider'
    );

  return context;
}

export { ContentPageProvider, useContentPage };
