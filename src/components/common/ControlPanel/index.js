/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBars,
  faCaretDown,
  faPlus,
  faRocket,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';

import { useDeploy } from '../../../context/DeployContext';
import { devices } from '../../../constants';
import NavigationMenu from '../NavigationMenu';
import { button as defaultButton, fetchDisable } from '../styles';
import Tooltip from '../Tooltip';
import DeployInfo from './DeployInfo';
import { useContentPage } from '../../../context/ContentPageContext';
import { Link } from 'react-router-dom';
import WarningMessages from '../WarningMessages';

const container = (theme) =>
  css({
    zIndex: 300,
    position: 'fixed',
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
    marginLeft: 70,
  });

const addIcon = css({
  fontSize: 10,
  marginRight: 8,
});

const numPerRowContainer = css({
  position: 'relative',
  marginLeft: 20,

  input: {
    width: 110,
    height: 27,
    textAlign: 'right',
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
  },

  p: {
    width: 110,
    height: 27,
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    fontSize: 13,
    border: '1px solid black',
    borderRadius: 2,
    paddingLeft: 10,
  },
});

const deviceSelectContainer = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginLeft: 40,
  fontVariant: 'small-caps',

  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    marginBottom: 2,
    width: 110,
    height: 27,
    backgroundColor: 'white',
    border: '1px solid black',
    borderRadius: 2,
    pointerEvents: 'none',
  },

  select: {
    fontSize: 12,
    width: 110,
    height: 27,
  },
});

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
  css(button, {
    backgroundColor: theme.colors.purple,
    justifySelf: 'end',
    position: 'relative',
  });

const deployIcon = css({
  marginLeft: 8,
  fontSize: 13,
});

const disableButton = css({
  opacity: 0.5,
  cursor: 'not-allowed',

  '&:hover': { opacity: 0.5 },
  '&:active': { opacity: 0.5 },
});

const showDeployInfoButton = (theme) =>
  css(button, {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    width: 14,
    height: 14,
    backgroundColor: 'white',
    color: theme.colors.midgrey,
  });

const backButton = css(defaultButton, {
  position: 'absolute',
  left: 20,
  bottom: -10,
  transform: 'translateY(100%)',
  display: 'flex',
  alignItems: 'center',
  color: 'black',
  border: '1px solid black',
  // backgroundColor: 'white',
  borderRadius: 2,
  fontSize: 11,
  fontWeight: 'bold',

  p: {
    marginLeft: 4,
  },
});

const backIcon = css({
  fontSize: 11,
});

function ControlPanel({ controls, errors }) {
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [selectOptionsShown, setSelectOptionsShown] = useState(false);

  const isError = useMemo(() => {
    if (!errors) return false;
    for (const [, value] of Object.entries(errors)) {
      if (value) return true;
    }
    return false;
  }, [errors]);

  const {
    page,
    unsavedChange,
    setDevice,
    saveIsActive,
    setControlPanelHeight,
  } = useContentPage();

  const {
    undeployedSave,
    showDeployInfo,
    setShowDeployInfo,
    deployData,
    createBuildStatus,
    fetchDeployStatus,
    createSiteBuild,
  } = useDeploy();
  const deployStatus = deployData?.state;

  const ref = (node) => {
    if (!node) return;

    const { height } = node.getBoundingClientRect();

    setControlPanelHeight(height);
  };

  return (
    <div css={[container, saveIsActive && fetchDisable]} ref={ref}>
      <DeployInfo />
      <div css={mainContent}>
        {!showDeployInfo && (
          <Tooltip message="Show deploy info">
            <button
              css={showDeployInfoButton}
              onClick={() => setShowDeployInfo(true)}
            >
              <FontAwesomeIcon icon={faCaretDown} />
            </button>
          </Tooltip>
        )}
        <FontAwesomeIcon
          css={navMenuIcon}
          icon={faBars}
          onClick={() => setShowNavigationMenu(true)}
        />
        <NavigationMenu
          show={showNavigationMenu}
          close={() => setShowNavigationMenu(false)}
        />
        {controls.addElements &&
          controls.addElements.map(({ text, func }, i) => (
            <div css={addItem} onClick={func} key={i}>
              <FontAwesomeIcon icon={faPlus} css={addIcon} />
              <p>Add {text}</p>
            </div>
          ))}
        {controls.elementsPerRow && controls.elementsPerRow.value && (
          <div css={numPerRowContainer}>
            <p>Items/row:</p>
            <input
              type="number"
              min="1"
              value={controls.elementsPerRow.value}
              onChange={(e) =>
                controls.elementsPerRow.update(Number(e.target.value))
              }
            />
          </div>
        )}
        {controls.device && (
          <div css={deviceSelectContainer}>
            {!selectOptionsShown && (
              <label htmlFor="deviceSelect">device</label>
            )}
            <select
              id="deviceSelect"
              onClick={() => setSelectOptionsShown(true)}
              onChange={(e) => setDevice(Number(e.target.value))}
            >
              {devices
                .sort((a, b) =>
                  page === 'press'
                    ? b.width - a.width
                    : b.aspectRatio - a.aspectRatio
                )
                .map((device, i) => (
                  <option value={i} key={device.name}>
                    {device.name} :{' '}
                    {page === 'press' ? device.width : device.aspectRatio}
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
              onClick={() => {
                if (unsavedChange) controls.undoChanges();
              }}
            >
              <p>undo changes</p>
              <FontAwesomeIcon icon={faUndo} />
            </div>
          </Tooltip>
        </div>
        <Tooltip message="Nothing to save" disable={unsavedChange}>
          <div
            css={[saveButton, (isError || !unsavedChange) && disableButton]}
            onClick={() => {
              if (!isError && unsavedChange) controls.save();
            }}
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
          disable={deployData?.state !== 'ready'}
        >
          <div
            css={[
              deployButton,
              (undeployedSave === false ||
                (!deployData && fetchDeployStatus !== 'rejected') ||
                deployStatus !== 'ready') &&
                disableButton,
            ]}
            onClick={createSiteBuild}
          >
            {!deployData && fetchDeployStatus !== 'rejected' ? (
              <p>Updating...</p>
            ) : createBuildStatus === 'pending' ||
              (deployData && deployStatus !== 'ready') ? (
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
      {controls.back && (
        <Link css={backButton} to={controls.back}>
          <FontAwesomeIcon css={backIcon} icon={faArrowLeft} />
          <p>BACK</p>
        </Link>
      )}
      {isError && <WarningMessages errors={errors} />}
    </div>
  );
}

export default ControlPanel;
