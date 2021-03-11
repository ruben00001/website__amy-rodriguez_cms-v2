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

  const {
    res: buildData,
    status: createBuildStatus,
    run: runCreateBuild,
  } = useAsync();
  const { status: fetchDeployStatus, run: runFetchDeploy } = useAsync();

  const netlifyClient = useMemo(
    () => new NetlifyAPI('W43FJpBK-fIAz1BxbBZB3-zmn6vQn4-3PjEHIXkT-aM'),
    []
  );
  const site_id =
    process.env.NODE_ENV === 'development'
      ? 'cf3b4320-664f-45d5-ba30-fd1e17803b87'
      : 'd894703e-7258-4219-9edd-4fb05e77d508';

  useLayoutEffect(() => {
    if (!latestSiteBuildOnStartupAttempted && netlifyClient) {
      setLatestSiteBuildOnStartupAttempted(true);
      const handleLatestSiteBuildDeploy = async () => {
        const builds = await netlifyClient.listSiteBuilds({ site_id });
        const latestBuild = builds[0];

        fetchDeploy(latestBuild.deploy_id);
      };
      handleLatestSiteBuildDeploy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSiteBuildOnStartupAttempted, netlifyClient]);

  const fetchDeploy = (deploy_id) =>
    runFetchDeploy(netlifyClient.getDeploy({ deploy_id }), (res) =>
      setDeployDataCopy(res)
    );

  const handleCreateSiteBuild = () => {
    setUndeployedSave(false);
    runCreateBuild(
      netlifyClient.createSiteBuild({ site_id }),
      (res) => fetchDeploy(res.deploy_id),
      () => setUndeployedSave(true)
    );
  };

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
        fetchDeploy: () => fetchDeploy(buildData.deploy_id),
        createSiteBuild: handleCreateSiteBuild,
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
