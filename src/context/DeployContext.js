import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react';
import NetlifyAPI from 'netlify';

import useAsync from '../hooks/useAsync';
import { useState } from 'react';

const DeployContext = createContext();
const { Provider } = DeployContext;

// should probs change undeployedSave to udeployedSave status and provide string consts for each state
// undeployedSave should reset on each page
const DeployProvider = ({ children }) => {
  const [undeployedSave, setUndeployedSave] = useState(null); // initial value is null because don't want to disable deploy button on startup since don't know if there was a previously undeployed save
  const [isCreatingBuildOrDeploying, setIsCreatingBuildOrDeploying] = useState(
    false
  );
  const [deployStatus, setDeployStatus] = useState(null); // deployStatus needed because deployData resets with each fetch, which in turn would reset the UI (as deployData becomes null)
  // const [deploy_id, setDeploy_id] = useState(null);
  // const [buildData, setBuildData] = useState({ state: 'idle' });
  const {
    data: createBuildData,
    status: createBuildStatus,
    run: runCreateBuild,
    reset: resetCreateBuild,
  } = useAsync();
  const {
    data: deployData,
    status: fetchDeployStatus,
    run: runFetchDeploy,
    reset: resetFetchDeploy,
  } = useAsync();

  useLayoutEffect(() => {
    if (createBuildStatus === 'resolved') {
      fetchDeploy();
    }
    if (createBuildStatus === 'rejected') {
      setUndeployedSave(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createBuildStatus]);

  useLayoutEffect(() => {
    if (fetchDeployStatus === 'resolved') {
      const deployStatus = deployData.state;
      setDeployStatus(deployStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDeployStatus]);

  useLayoutEffect(() => {
    console.log('deployStatus:', deployStatus);
    if (deployStatus === 'ready') {
      setIsCreatingBuildOrDeploying(false);
    }
    if (deployStatus === 'error') {
      setUndeployedSave(true);
      setIsCreatingBuildOrDeploying(false);
    }
  }, [deployStatus]);

  useEffect(() => {
    if (fetchDeployStatus) console.log('fetchDeployStatus:', fetchDeployStatus);
  }, [fetchDeployStatus]);

  function createSiteBuild() {
    if (deployStatus) {
      resetBuildAndDeploy();
    }

    console.log('CREATING SITE BUILD...');
    setUndeployedSave(false);
    setIsCreatingBuildOrDeploying(true);
    // const site_id = "d894703e-7258-4219-9edd-4fb05e77d508" // PRODUCTION
    const site_id = 'cf3b4320-664f-45d5-ba30-fd1e17803b87'; // DEVELOPMENT
    const client = new NetlifyAPI(
      'W43FJpBK-fIAz1BxbBZB3-zmn6vQn4-3PjEHIXkT-aM'
    );

    runCreateBuild(client.createSiteBuild({ site_id }));
  }

  function fetchDeploy() {
    console.log('FETCHING DEPLOY...');
    const client = new NetlifyAPI(
      'W43FJpBK-fIAz1BxbBZB3-zmn6vQn4-3PjEHIXkT-aM'
    );
    // const deploy_id = 'aboceunoeuh'; // FAIL
    const { deploy_id } = createBuildData;
    runFetchDeploy(client.getDeploy({ deploy_id }));
  }

  function resetBuildAndDeploy() {
    setIsCreatingBuildOrDeploying(false);
    setDeployStatus(null);
    resetCreateBuild();
    resetFetchDeploy();
  }

  return (
    <Provider
      value={{
        undeployedSave,
        setUndeployedSave,
        createSiteBuild,
        createBuildStatus,
        fetchDeploy,
        fetchDeployStatus,
        deployData,
        deployStatus,
        isCreatingBuildOrDeploying,
        resetBuildAndDeploy,
      }}
    >
      {children}
    </Provider>
  );
};

function useDeploy() {
  const context = useContext(DeployContext);
  if (!context)
    throw new Error('useDeploy must be used within the DeployProvider');

  return context;
}

export { DeployProvider, useDeploy };
