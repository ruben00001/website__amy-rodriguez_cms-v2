/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, { useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faSync } from '@fortawesome/free-solid-svg-icons';

import { useDeploy } from '../../../context/DeployContext';

import {
  conventToLocalDateString,
  convertToLocalTimeString,
} from '../../../utils';

import { button } from '../styles';

import Tooltip from '../Tooltip';

const deployInfoContainer = (theme) =>
  css({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    fontSize: 13,
    borderBottom: `1px solid ${theme.colors.lightgrey}`,
    paddingBottom: 10,
  });

const showDeployInfoControl = (theme) =>
  css(button, {
    position: 'absolute',
    left: '50%',
    top: -5,
    color: theme.colors.midgrey,
    transform: 'translateX(-50%)',
  });

const deployStatusContainer = css({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
});

const deployPendingInfoStyle = css({
  display: 'flex',
  justifyContent: 'space-between',
  flexGrow: 1,
});

const deployUpdateButton = css({
  fontSize: 11,
  border: '1px solid black',
  display: 'flex',
  alignItems: 'center',
  padding: '2px 5px',
  marginLeft: 10,
  borderRadius: 2,
  cursor: 'pointer',

  p: {
    marginRight: 5,
  },

  '&:hover': { opacity: 0.8 },
  '&:active': { opacity: 1 },
});

const disableButton = css({
  opacity: 0.5,
  cursor: 'not-allowed',

  '&:hover': { opacity: 0.5 },
  '&:active': { opacity: 0.5 },
});

function DeployInfo() {
  const {
    showDeployInfo,
    setShowDeployInfo,
    deployData,
    fetchDeploy,
    // deployProcessPending,
    lastBuildData,
    // listBuildsStatus,
    deployStatus,
    createBuildStatus,
    fetchDeployStatus,
  } = useDeploy();

  useLayoutEffect(() => {
    if (createBuildStatus === 'pending') {
      setShowDeployInfo(true);
    }
  }, [createBuildStatus, setShowDeployInfo]);

  return (
    <React.Fragment>
      {deployStatus && showDeployInfo && (
        <div css={deployInfoContainer}>
          <Tooltip message="Hide deploy info">
            <div
              css={showDeployInfoControl}
              onClick={() => setShowDeployInfo(false)}
            >
              <FontAwesomeIcon icon={faCaretUp} />
            </div>
          </Tooltip>
          {(deployStatus === 'enqueued' ||
            deployStatus === 'building' ||
            deployStatus === 'processing' ||
            fetchDeployStatus === 'rejected') && (
            <div css={deployStatusContainer}>
              {fetchDeployStatus === 'rejected' ? (
                <p
                  css={{
                    flexGrow: 1,
                    textAlign: 'right',
                  }}
                >
                  Attempt to update deploy status FAILED. Please try again
                </p>
              ) : (
                <div css={deployPendingInfoStyle}>
                  <p>
                    Deploy started at{' '}
                    <b>{convertToLocalTimeString(deployData.created_at)}</b>
                  </p>
                  <p css={{ fontStyle: 'italic' }}>
                    Please bear in mind a deploy may take 15+ mins
                  </p>
                  <p>
                    Deploy status: <b>{deployStatus}</b>
                  </p>
                </div>
              )}
              <div
                css={[
                  deployUpdateButton,
                  fetchDeployStatus === 'pending' && disableButton,
                ]}
                onClick={() => {
                  if (fetchDeployStatus !== 'pending') fetchDeploy();
                }}
              >
                {fetchDeployStatus === 'pending' ? (
                  <p>Updating...</p>
                ) : (
                  <React.Fragment>
                    {' '}
                    <p>Update Status</p>
                    <FontAwesomeIcon icon={faSync} />
                  </React.Fragment>
                )}
              </div>
            </div>
          )}
          {(deployStatus === 'ready' || deployStatus === 'error') && (
            <React.Fragment>
              {deployStatus === 'ready' ? (
                <p>
                  Last deploy:{' '}
                  <b>{convertToLocalTimeString(deployData.published_at)}</b> on{' '}
                  <b> {conventToLocalDateString(deployData.published_at)}</b>
                </p>
              ) : (
                <p>
                  Last deploy, created at{' '}
                  {convertToLocalTimeString(lastBuildData.created_at)} on{' '}
                  {conventToLocalDateString(lastBuildData.created_at)}
                  <b>, failed</b>. Please try again. If the problem persists,
                  contact Ruben.
                </p>
              )}
            </React.Fragment>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default DeployInfo;
