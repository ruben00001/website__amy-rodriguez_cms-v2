import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
} from 'react';
import NetlifyAPI from 'netlify';

import useAsync from '../hooks/useAsync';
import { useState } from 'react';

const DeployContext = createContext();
const { Provider } = DeployContext;

const DeployProvider = ({ children }) => {
  const [undeployedSave, setUndeployedSave] = useState(true);
  const [showDeployInfo, setShowDeployInfo] = useState(true);
  const [
    latestSiteBuildOnStartupAttempted,
    setLatestSiteBuildOnStartupAttempted,
  ] = useState(false);
  const [deployDataCopy, setDeployDataCopy] = useState(null); // deployDataCopy needed because deployData resets with fetch - want UI to have access to latest deploy data at all times

  // HOOKS

  const {
    res: listBuildsData,
    status: listBuildsStatus,
    run: runListBuilds,
  } = useAsync();
  const {
    res: createBuildData,
    status: createBuildStatus,
    run: runCreateBuild,
  } = useAsync();
  const { status: fetchDeployStatus, run: runFetchDeploy } = useAsync();

  // SET UP DATA

  const netlifyClient = useMemo(
    () => new NetlifyAPI('W43FJpBK-fIAz1BxbBZB3-zmn6vQn4-3PjEHIXkT-aM'),
    []
  );
  // const site_id = 'd894703e-7258-4219-9edd-4fb05e77d508';
  const site_id =
    process.env.NODE_ENV === 'development'
      ? 'cf3b4320-664f-45d5-ba30-fd1e17803b87'
      : 'd894703e-7258-4219-9edd-4fb05e77d508';

  useLayoutEffect(() => {
    if (latestSiteBuildOnStartupAttempted || !netlifyClient) return;

    setLatestSiteBuildOnStartupAttempted(true);

    runListBuilds(netlifyClient.listSiteBuilds({ site_id }), (res) =>
      fetchDeploy(res[0].deploy_id)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSiteBuildOnStartupAttempted, netlifyClient]);

  // HELPERS

  const fetchDeploy = (deploy_id) =>
    runFetchDeploy(netlifyClient.getDeploy({ deploy_id }), (res) =>
      setDeployDataCopy(res)
    );

  const handleCreateSiteBuild = () => {
    setUndeployedSave(false);
    runCreateBuild(
      netlifyClient.createSiteBuild({ site_id }),
      (res) => fetchDeploy(res.deploy_id),
      () => setUndeployedSave(true) // process error
    );
  };

  // DERIVED DATA

  const deployStatus = deployDataCopy?.state;

  const deployProcessPending = useMemo(
    () =>
      createBuildStatus === 'pending' ||
      deployStatus === 'enqueued' ||
      deployStatus === 'building' ||
      deployStatus === 'processing'
        ? true
        : false,
    [createBuildStatus, deployStatus]
  );

  // const interpretStatuses = useMemo(() => {
  //   if(listBuildsStatus === 'idle' || listBuildsStatus === 'pending' ) return 'Updating'
  //   if(listBuildsStatus === 'rejected')
  // }, []);

  return (
    <Provider
      value={{
        undeployedSave,
        setUndeployedSave,
        showDeployInfo,
        setShowDeployInfo,
        latestSiteBuildOnStartupAttempted,
        deployData: deployDataCopy,
        createBuildStatus,
        fetchDeployStatus,
        fetchDeploy: () => fetchDeploy(createBuildData.deploy_id),
        createSiteBuild: handleCreateSiteBuild,
        //-------------------
        deployStatus,
        deployProcessPending,
        lastBuildData: listBuildsData ? listBuildsData[0] : null,
        listBuildsStatus,
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
