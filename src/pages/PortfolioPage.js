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
import WarningMessages from '../components/common/WarningMessages';
import RouterPrompt from '../components/common/RouterPrompt';
import { button } from '../components/common/styles';
import {
  calcPercentageValue,
  confirmWrapper,
  convertValueToPercent,
  createDefaultImageComponent,
  selectImage,
  selectStyleDataForDevice,
  sortByAscendingOrder,
} from '../utils';

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
// check controlsbeingused functionality for errors
// position and width could be memoised instead of invoked with every render
// save warning before deploy?; or save and deploy option?

function PortfolioPage() {
  // const [imageComponentsModified, setImageComponentsModified] = useState(null);
  // const [controlsBeingUsed, setControlsBeingUsed] = useState(false);
  // const [unsavedChange, setUnsavedChange] = useState(false);
  // const [showAddImagePopup, setShowAddImagePopup] = useState(false);

  // const imageComponentsWithOrderErrorIds = useMemo(() => {
  //   if (!imageComponentsModified) {
  //     return null;
  //   }
  //   if (imageComponentsModified.length < 2) {
  //     return null;
  //   }

  //   const componentsWithErrorIds = [];
  //   const componentsSorted = produce(imageComponentsModified, (draft) =>
  //     draft.sort(sortByAscendingOrder)
  //   );
  //   for (let i = 0; i < componentsSorted.length; i++) {
  //     const order = componentsSorted[i].order;
  //     const nextOrder = componentsSorted[i + 1]?.order;
  //     if (!nextOrder) break;
  //     if (order === nextOrder) {
  //       componentsWithErrorIds.push(componentsSorted[i].id);
  //       componentsWithErrorIds.push(componentsSorted[i + 1].id);
  //       i++; // i++ definitely works?
  //     }
  //   }

  //   return componentsWithErrorIds;
  // }, [imageComponentsModified]);

  // // SET UP DATA

  // const [deviceNum, setDeviceNum] = useState(0);
  // const device = useMemo(() => devices[deviceNum], [deviceNum]);

  // const { portfolio: portfolioDataRoot } = useData();
  // const { pageId: pageIdString } = useParams();
  // const pageIdNumber = useMemo(() => Number(pageIdString), [pageIdString]);

  // const imageComponentsRootProcessed = useMemo(() => {
  //   const pageData = portfolioDataRoot.find((page) => page.id === pageIdNumber);
  //   const imageComponentsRoot = pageData.imageComponents;

  //   return produce(imageComponentsRoot, (draft) => {
  //     draft.sort((a, b) => a.order - b.order);
  //     draft.forEach((component, i) => {
  //       component.order = i + 1;
  //     });
  //   });
  // }, [pageIdNumber, portfolioDataRoot]);

  // const bodyRef = useRef();
  // const { width: canvasWidth, height: canvasHeight } = useCanvasSize({
  //   parentWidth: bodyRef.current?.offsetWidth,
  //   parentHeight: bodyRef.current?.offsetHeight,
  //   device,
  // });

  // const { save, status: saveStatus } = useSavePortfolioPage(
  //   pageIdNumber,
  //   setUnsavedChange
  // );

  // useLayoutEffect(() => {
  //   console.log(
  //     '🚀 ~ file: PortfolioPage.js ~ line 122 ~ useLayoutEffect ~ imageComponentsRootProcessed',
  //     imageComponentsRootProcessed
  //   );
  //   setImageComponentsModified(imageComponentsRootProcessed);
  // }, [imageComponentsRootProcessed]);

  // // HELPER FUNCTIONS

  // function selectStyleComponentAndCalcValue(styleType, components) {
  //   const component = selectStyleDataForDevice(components, device);
  //   if (styleType === 'position') {
  //     return {
  //       x: calcPercentageValue(component.x, canvasWidth),
  //       y: calcPercentageValue(component.y, canvasHeight),
  //     };
  //   }
  //   if (styleType === 'width') {
  //     return component.value;
  //   }
  // }

  // // UPDATE MODIFIED DATA

  // function setImageComponentStyleField(imageComponentId, field, newValue) {
  //   setImageComponentsModified(
  //     produce((draft) => {
  //       const imageComponent = draft.find(
  //         (component) => component.id === imageComponentId
  //       );
  //       const styleComponents = imageComponent[field];
  //       const currentStyleComponentForDevice = selectStyleDataForDevice(
  //         styleComponents,
  //         device
  //       );

  //       if (device.aspectRatio === currentStyleComponentForDevice.aspectRatio) {
  //         const styleComponentIndex = styleComponents.findIndex(
  //           (value) =>
  //             value.aspectRatio === currentStyleComponentForDevice.aspectRatio
  //         );
  //         styleComponents.splice(styleComponentIndex, 1);
  //       }

  //       const newStyleComponent = {
  //         aspectRatio: device.aspectRatio,
  //       };
  //       if (field === 'positions') {
  //         newStyleComponent.x = convertValueToPercent(newValue.x, canvasWidth);
  //         newStyleComponent.y = convertValueToPercent(newValue.y, canvasHeight);
  //       }
  //       if (field === 'widths') {
  //         newStyleComponent.value = newValue;
  //       }

  //       styleComponents.push(newStyleComponent);
  //       styleComponents.sort((a, b) => b.aspectRatio - a.aspectRatio);
  //     })
  //   );
  //   setUnsavedChange(true);
  // }

  // function setImageComponentHierarchyField(imageComponentId, field, newValue) {
  //   setImageComponentsModified(
  //     produce((draft) => {
  //       const imageComponent = draft.find(
  //         (component) => component.id === imageComponentId
  //       );
  //       imageComponent[field] = newValue;
  //     })
  //   );
  //   setUnsavedChange(true);
  // }

  // function addImage(image) {
  //   setImageComponentsModified((imageComponents) => {
  //     const newComponent = createDefaultImageComponent({
  //       imageComponents,
  //       image,
  //       device,
  //       page: 'portfolio',
  //     });

  //     return [...imageComponents, newComponent];
  //   });
  //   setUnsavedChange(true);
  // }

  // function deleteImage(componentToDeleteId) {
  //   function payload() {
  //     setImageComponentsModified(
  //       produce((draft) => {
  //         const deleteIndex = draft.findIndex(
  //           (component) => component.id === componentToDeleteId
  //         );
  //         draft.splice(deleteIndex, 1);
  //         // automatically update orders so user doesn't have to do manually and to prevent bug with imageControls.js
  //         draft.sort((a, b) => a.order - b.order);
  //         draft.forEach((component, i) => {
  //           component.order = i + 1;

  //           if (component.layer > draft.length) {
  //             component.layer = draft.length;
  //           }
  //         });
  //       })
  //     );
  //     setControlsBeingUsed(null); // component removed without reset leads to other image components not being usable
  //     setUnsavedChange(true);
  //   }
  //   const confirmMessage = 'Are you sure you want to delete this image?';

  //   confirmWrapper(confirmMessage, payload);
  // }

  // function undoAllChanges() {
  //   function payload() {
  //     setImageComponentsModified(imageComponentsRootProcessed);
  //     setUnsavedChange(false);
  //   }
  //   const confirmMessage =
  //     'Any unsaved work will be lost. Are you sure you want to undo all changes?';

  //   confirmWrapper(confirmMessage, payload);
  // }

  return (
    <div css={container}>
      {/* <ControlPanel
        position="static"
        setDevice={setDeviceNum}
        addImage={() => setShowAddImagePopup(true)}
        save={() => save(imageComponentsModified)}
        unsavedChange={unsavedChange}
        isError={
          imageComponentsWithOrderErrorIds &&
          imageComponentsWithOrderErrorIds[0]
        }
        undoAllChanges={undoAllChanges}
      />
      <AddImagePopup
        show={showAddImagePopup}
        close={() => setShowAddImagePopup(false)}
        addImage={addImage}
      />
      <div css={body} ref={bodyRef}>
        <Link css={backButton} to={'/portfolio'}>
          <FontAwesomeIcon css={backIcon} icon={faArrowLeft} />
          <p>BACK</p>
        </Link>
        <WarningMessages
          errors={{
            order:
              imageComponentsWithOrderErrorIds &&
              imageComponentsWithOrderErrorIds[0],
          }}
        />
        {canvasWidth && canvasHeight && (
          <div
            css={[
              portfolioPage,
              {
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
              },
            ]}
          >
            {imageComponentsModified &&
              imageComponentsModified.map((imageComponent) => (
                <RndImage
                  imgSrc={selectImage(imageComponent.image.image, 'medium')}
                  width={selectStyleComponentAndCalcValue(
                    'width',
                    imageComponent.widths
                  )}
                  position={selectStyleComponentAndCalcValue(
                    'position',
                    imageComponent.positions
                  )}
                  setStyleField={(field, newValue) =>
                    setImageComponentStyleField(
                      imageComponent.id,
                      field,
                      newValue
                    )
                  }
                  order={imageComponent.order}
                  layer={imageComponent.layer}
                  numberImageComponents={imageComponentsModified.length}
                  controlsBeingUsed={controlsBeingUsed}
                  controlsBeingUsedByComponent={
                    controlsBeingUsed === imageComponent.id
                  }
                  setHierarchyField={(field, newValue) =>
                    setImageComponentHierarchyField(
                      imageComponent.id,
                      field,
                      newValue
                    )
                  }
                  deleteImage={() => deleteImage(imageComponent.id)}
                  setControlsBeingUsedOn={() =>
                    setControlsBeingUsed(imageComponent.id)
                  }
                  setControlsBeingUsedOff={() => setControlsBeingUsed(null)}
                  orderError={imageComponentsWithOrderErrorIds.includes(
                    imageComponent.id
                  )}
                  key={imageComponent.id}
                />
              ))}
          </div>
        )}
      </div>
      <RouterPrompt unsavedChange={unsavedChange} /> */}
    </div>
  );
}

export default PortfolioPage;
