/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faPlus,
  faRocket,
  faSync,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';

import { useDeploy } from '../../context/DeployContext';
import { devices } from '../../constants';
import { convertToLocalTimeString } from '../../utils';
import NavigationMenu from './NavigationMenu';
import { button as defaultButton, fetchDisable } from './styles';
import { forwardRef } from 'react';
import Tooltip from './Tooltip';

const container = (theme) =>
  css({
    zIndex: 300,
    width: '100%',
    backgroundColor: 'white',
    padding: '15px 20px',
    borderBottom: `2px solid ${theme.colors.lightmidgrey}`,
  });

const mainContent = css({
  display: 'flex',
  alignItems: 'center',
});

const navMenuIcon = css(defaultButton, {
  fontSize: 20,
  cursor: 'pointer',
});

const button = css({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 110,
  height: 27,
  fontWeight: 500,
  color: 'white',
  borderRadius: 2,
  cursor: 'pointer',
  boxSizing: 'content-box',

  '&:hover': { opacity: 0.8 },
  '&:active': { opacity: 1 },

  p: {
    fontSize: 13,
  },
});

const addItem = (theme) =>
  css(button, {
    backgroundColor: theme.colors.lightblue,
    marginLeft: 110,
  });

const addIcon = css({
  fontSize: 10,
  marginRight: 8,
});

const deviceSelectContainer = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginLeft: 40,
  fontVariant: 'small-caps',

  p: {
    fontSize: 14,
    marginBottom: 2,
  },
});

const deviceSelect = css({ height: 17, fontSize: 12, width: 80 });

const undoContainer = css({
  marginLeft: 'auto',
  marginRight: 40,
});

const undoButton = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  border: '1px solid black',
  borderRadius: 2,
  fontSize: 11,
  height: 27,
  padding: '0 12px',
  cursor: 'pointer',
  fontVariant: 'small-caps',

  '&:hover': { opacity: 0.8 },
  '&:active': { opacity: 1 },

  p: {
    marginRight: 8,
  },
});

const saveButton = (theme) =>
  css(button, {
    backgroundColor: theme.colors.darkblue,
    // marginLeft: 'auto',
    marginRight: 20,
  });

const deployButton = (theme) =>
  css(button, { backgroundColor: theme.colors.purple, justifySelf: 'end' });

const deployIcon = css({
  marginLeft: 8,
  fontSize: 13,
});

const disableButton = css({
  pointerEvents: 'none',
  opacity: 0.5,
  cursor: 'not-allowed',
});

const deployInfoContainer = css({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: 10,
  fontSize: 13,
});

const deployStatusContainer = css({
  display: 'flex',
  alignItems: 'center',
});

const deployUpdateButton = css({
  fontSize: 12,
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

const removeDeployInfoButton = css({
  border: '1px solid black',
  borderRadius: 1,
  marginLeft: 8,
  padding: '0.5px 3px',
  fontSize: 11,
  cursor: 'pointer',

  '&:hover': { opacity: 0.8 },
  '&:active': { opacity: 1 },
});

/* NOTES
  - adding element repeated - should just change text + onClick func
*/

const ControlPanel = forwardRef(
  (
    {
      position,
      addPage,
      addImage,
      addPressElement,
      setDevice,
      save,
      isError,
      unsavedChange,
      undoAllChanges,
      fetchStatus,
    },
    ref
  ) => {
    const [showNavigationMenu, setShowNavigationMenu] = useState(false);
    const {
      undeployedSave,
      createSiteBuild,
      fetchDeploy,
      fetchDeployStatus,
      deployData,
      deployStatus,
      isCreatingBuildOrDeploying,
      resetBuildAndDeploy,
    } = useDeploy();

    return (
      <div
        css={[container, { position }, fetchStatus !== 'idle' && fetchDisable]}
        ref={ref}
      >
        {deployStatus && (
          <div css={deployInfoContainer}>
            {(deployStatus === 'enqueued' ||
              deployStatus === 'building' ||
              deployStatus === 'processing' ||
              fetchDeployStatus === 'rejected') && (
              <div css={deployStatusContainer}>
                {fetchDeployStatus === 'rejected' ? (
                  <p>
                    Attempt to update deploy status FAILED. Please try again
                  </p>
                ) : (
                  <p>
                    <em>Please bear in mind a deploy may take 10+ mins </em> |
                    {'  '}
                    <b>Deploy status: {deployStatus}</b>
                  </p>
                )}
                <div
                  css={[
                    deployUpdateButton,
                    fetchDeployStatus === 'pending' && disableButton,
                  ]}
                  onClick={fetchDeploy}
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
                    Deploy succeeded at{' '}
                    {convertToLocalTimeString(deployData.published_at)}
                  </p>
                ) : (
                  <p>
                    Deploy FAILED. Please try again. If the problem persists,
                    please contact Ruben.
                  </p>
                )}
                <div css={removeDeployInfoButton} onClick={resetBuildAndDeploy}>
                  Ok
                </div>
              </React.Fragment>
            )}
          </div>
        )}
        <div css={mainContent}>
          <FontAwesomeIcon
            css={navMenuIcon}
            icon={faBars}
            onClick={() => setShowNavigationMenu(true)}
          />
          <NavigationMenu
            show={showNavigationMenu}
            close={() => setShowNavigationMenu(false)}
          />
          {addPage && (
            <div css={addItem} onClick={() => addPage()}>
              <FontAwesomeIcon icon={faPlus} css={addIcon} />
              <p>Add Page</p>
            </div>
          )}
          {addImage && (
            <div css={addItem} onClick={() => addImage()}>
              <FontAwesomeIcon icon={faPlus} css={addIcon} />
              <p>Add Image</p>
            </div>
          )}
          {addPressElement && (
            <div css={addItem} onClick={() => addPressElement()}>
              <FontAwesomeIcon icon={faPlus} css={addIcon} />
              <p>Add Element</p>
            </div>
          )}
          {setDevice && (
            <div css={deviceSelectContainer}>
              <p>select device</p>
              <select
                css={deviceSelect}
                onChange={(e) => setDevice(Number(e.target.value))}
              >
                {devices.map((device, i) => (
                  <option value={i} key={device.name}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div css={undoContainer}>
            <Tooltip
              message={
                unsavedChange
                  ? 'Undo changes since last save'
                  : 'No changes to undo'
              }
            >
              <div
                css={[undoButton, !unsavedChange && disableButton]}
                onClick={undoAllChanges}
              >
                <p>undo changes</p>
                <FontAwesomeIcon icon={faUndo} />
              </div>
            </Tooltip>
          </div>
          <Tooltip message="Nothing to save" disable={unsavedChange}>
            <div
              css={[saveButton, (isError || !unsavedChange) && disableButton]}
              onClick={save}
            >
              <p>Save</p>
            </div>
          </Tooltip>
          <Tooltip
            message={
              undeployedSave ? (
                <em>Do this at the end of each session</em>
              ) : (
                'Nothing to deploy'
              )
            }
            translate={undeployedSave ? -40 : 0}
            disable={deployStatus !== null && deployStatus !== 'ready'}
          >
            <div
              css={[
                deployButton,
                (undeployedSave === false || isCreatingBuildOrDeploying) &&
                  disableButton,
              ]}
              onClick={createSiteBuild}
            >
              {isCreatingBuildOrDeploying ? (
                <p>Deploying...</p>
              ) : (
                <React.Fragment>
                  <p>Deploy</p>
                  <FontAwesomeIcon icon={faRocket} css={deployIcon} />
                </React.Fragment>
              )}
            </div>
          </Tooltip>
        </div>
      </div>
    );
  }
);

export default ControlPanel;
