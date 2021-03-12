/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

import { useContentPage } from '../../context/ContentPageContext';

import { scrollToBottom, scrollToTop } from '../../utils';

import ControlPanel from './ControlPanel';
import LoadingBar from './LoadingBar';
import LoadingOverlay from './LoadingOverlay';
import Settings from './Settings';
import RouterPrompt from './RouterPrompt';

import { button, fetchDisable } from './styles';
import useCloseTabWarning from '../../hooks/useCloseTabWarning';

const container = (theme) =>
  css({
    position: 'relative',
    minHeight: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: theme.colors.verylightgrey,
  });

const body = (theme) =>
  css({
    position: 'relative',

    overflowY: 'visible',
    overflowX: 'hidden',
    height: '100%',
    backgroundColor: theme.colors.verylightgrey,
  });

const scrollButton = css(button, {
  zIndex: 200,
  position: 'fixed',
  left: 5,
  display: 'flex',
  alignItems: 'center',
  color: 'black',
  border: '1px solid black',

  borderRadius: 2,
  fontSize: 11,
  fontWeight: 'bold',

  p: {
    marginLeft: 4,
  },
});

const scrollIcon = css({
  fontSize: 11,
});

/* NOTES
  - need to handle image fetch - could be done in relevant page/image popup
  - body should change with size of control panel
*/

const ContentPageWrapper = ({
  children,
  controls,
  rootDataFetchStatus,
  resetRootDataFetch,
  editImagePopup,
  editTextPopup,
  errors,
}) => {
  const {
    page,
    unsavedChange,
    saveIsActive,
    saveStatus,
    singleScreenBodyHeight,
    controlPanelHeight,
  } = useContentPage();

  useCloseTabWarning(unsavedChange);

  return (
    <div
      css={[
        container,
        (page === 'portfolio-page' || page === 'product') && {
          height: '100vh',
          overflowY: 'hidden',
        },
      ]}
    >
      {rootDataFetchStatus && rootDataFetchStatus !== 'complete' && (
        <LoadingOverlay
          page="press"
          fetchStatus={rootDataFetchStatus}
          fetchData={resetRootDataFetch}
        />
      )}
      <LoadingBar status={saveStatus} showStatusText={true} />
      <ControlPanel controls={controls} errors={errors} />
      {page === 'shop' && (
        <React.Fragment>
          <div
            css={[scrollButton, { top: controlPanelHeight + 10 }]}
            onClick={scrollToBottom}
          >
            <FontAwesomeIcon css={scrollIcon} icon={faArrowDown} />
            <p>bot</p>
          </div>
          <div css={[scrollButton, { bottom: 10 }]} onClick={scrollToTop}>
            <FontAwesomeIcon css={scrollIcon} icon={faArrowUp} />
            <p>top</p>
          </div>
        </React.Fragment>
      )}
      {controlPanelHeight && singleScreenBodyHeight && (
        <div
          css={[
            body,
            {
              marginTop: controlPanelHeight,
              minHeight: singleScreenBodyHeight,
            },
            (page === 'shop' || page === 'press') && { paddingBottom: 600 },
            saveIsActive && fetchDisable,
          ]}
        >
          {children}
        </div>
      )}
      <Settings />
      {editImagePopup && editImagePopup}
      {editTextPopup && editTextPopup}
      <RouterPrompt unsavedChange={unsavedChange} />
    </div>
  );
};
export default ContentPageWrapper;
