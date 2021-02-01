/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import produce from 'immer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { useData } from '../context/DataContext';
import useCanvasSize from '../hooks/useCanvasSize';
import { devices } from '../constants';
import ControlPanel from '../components/common/ControlPanel';
import RndImage from '../components/common/RndImage';
import AddImagePopup from '../components/common/AddImagePopup';
import useSavePortfolioPage from '../hooks/useSavePortfolioPage';
import ApiRequestOverlay from '../components/common/ApiRequestOverlay';
import WarningMessages from '../components/common/WarningMessages';
import RouterPrompt from '../components/common/RouterPrompt';
import { button } from '../components/common/styles';

const container = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
});

const body = (theme) =>
  css({
    display: 'flex',
    position: 'relative',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.verylightgrey,
  });

const backButton = css(button, {
  position: 'absolute',
  left: 20,
  top: 8,
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

const portfolioPage = css({
  position: 'relative',
  backgroundColor: 'white',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
});

// TODO
// save warning before deploy?; or save and deploy option?

function PortfolioPage() {
  const [imageComponentsModified, setImageComponentsModified] = useState(null);
  const [deviceNum, setDeviceNum] = useState(0);
  const [errors, setErrors] = useState({ order: [] });
  const [unsavedChange, setUnsavedChange] = useState(false);
  const [showAddImagePopup, setShowAddImagePopup] = useState(false);
  const [controlsBeingUsed, setControlsBeingUsed] = useState(false);

  const { portfolio: portfolioDataRoot } = useData();
  const { pageId: pageIdString } = useParams();
  const pageIdNumber = useMemo(() => Number(pageIdString), [pageIdString]);

  const imageComponentsRootProcessed = useMemo(() => {
    const pageData = portfolioDataRoot.find((page) => page.id === pageIdNumber);
    const imageComponentsRoot = pageData.imageComponents;

    return produce(imageComponentsRoot, (draft) => {
      draft.sort((a, b) => a.order - b.order);
      draft.forEach((component, i) => {
        component.order = i + 1;
      });
    });
  }, [pageIdNumber, portfolioDataRoot]);

  const bodyRef = useRef();
  const pageDimensions = useCanvasSize({
    parentWidth: bodyRef.current?.offsetWidth,
    parentHeight: bodyRef.current?.offsetHeight,
    device: devices[deviceNum],
  });

  const { save, status: saveStatus } = useSavePortfolioPage(
    pageIdNumber,
    setUnsavedChange
  );

  useLayoutEffect(() => {
    setImageComponentsModified(imageComponentsRootProcessed);
  }, [imageComponentsRootProcessed]);

  useLayoutEffect(() => {
    if (imageComponentsModified) {
      function checkForOrderErrorsAndUpdateState() {
        if (imageComponentsModified.length < 2) {
          setErrors((errors) => {
            return {
              ...errors,
              order: [],
            };
          });
          return;
        }
        const imageComponentsByOrder = produce(
          imageComponentsModified,
          (draft) => draft.sort((a, b) => a.order - b.order)
        );
        const imageComponentsWithOrderError = [];

        for (let i = 0; i < imageComponentsByOrder.length; i++) {
          const order = imageComponentsByOrder[i].order;
          const nextOrder = imageComponentsByOrder[i + 1]?.order;
          if (!nextOrder) break;
          if (order === nextOrder) {
            imageComponentsWithOrderError.push(imageComponentsByOrder[i]);
            imageComponentsWithOrderError.push(imageComponentsByOrder[i + 1]);
            i++;
          }
        }

        setErrors((errors) => {
          return {
            ...errors,
            order: imageComponentsWithOrderError.map(
              (component) => component.id
            ),
          };
        });
      }

      checkForOrderErrorsAndUpdateState();
    }
  }, [imageComponentsModified]);

  function undoAllChanges() {
    const confirmRes = window.confirm(
      'Any unsaved work will be lost. Are you sure you want to undo all changes?'
    );
    if (confirmRes) {
      setImageComponentsModified(imageComponentsRootProcessed);
      setUnsavedChange(false);
    }
  }

  return (
    <div css={container}>
      <ApiRequestOverlay status={saveStatus} />
      <ControlPanel
        position="static"
        setDevice={setDeviceNum}
        addImage={() => setShowAddImagePopup(true)}
        save={() => save(imageComponentsModified)}
        unsavedChange={unsavedChange}
        errors={errors}
        undoAllChanges={undoAllChanges}
      />
      <AddImagePopup
        show={showAddImagePopup}
        close={() => setShowAddImagePopup(false)}
        setImageComponentsModified={setImageComponentsModified}
        setUnsavedChange={setUnsavedChange}
        device={devices[deviceNum]}
      />
      <div css={body} ref={bodyRef}>
        <Link css={backButton} to={'/portfolio'}>
          <FontAwesomeIcon css={backIcon} icon={faArrowLeft} />
          <p>BACK</p>
        </Link>
        <WarningMessages errors={errors} />
        {pageDimensions && (
          <div
            css={[
              portfolioPage,
              {
                width: `${pageDimensions.width}px`,
                height: `${pageDimensions.height}px`,
              },
            ]}
          >
            {imageComponentsModified.map((component) => (
              <RndImage
                data={component}
                device={devices[deviceNum]}
                pageDimensions={pageDimensions}
                imageComponentsModified={imageComponentsModified}
                setImageComponentsModified={setImageComponentsModified}
                errors={errors}
                controlsBeingUsed={controlsBeingUsed}
                setControlsBeingUsed={setControlsBeingUsed}
                setUnsavedChange={setUnsavedChange}
                key={component.id}
              />
            ))}
          </div>
        )}
      </div>
      <RouterPrompt unsavedChange={unsavedChange} />
    </div>
  );
}

export default PortfolioPage;
