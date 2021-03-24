/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useMemo, useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import produce from 'immer';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '../context/DataContext';
import {
  ContentPageProvider,
  useContentPage,
} from '../context/ContentPageContext';

import {
  calcPercentageValue,
  convertValueToPercent,
  findElement,
  sortByAscending,
} from '../utils';
import {
  addElement,
  deleteElement,
  selectComponent,
  confirmWrapper,
  createImageComponent,
  selectImage,
} from '../utils/contentPageUtils';
import { processSaveResData, rmTempFields } from '../utils/processData';

import ContentPageWrapper from '../components/common/ContentPageWrapper';
import RndElement from '../components/common/RndElement';
import EditImagePopup from '../components/common/EditImagePopup';
import ImageElement from '../components/portfolio-page/ImageElement';

import { canvasDefault } from '../components/common/styles';

const canvas = css(canvasDefault, {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
});

function Content() {
  const [imageComponentsModified, setImageComponentsModified] = useState([]);
  const [controlUsed, setControlUsed] = useState(false);
  const [showEditImagePopup, setShowEditImagePopup] = useState(false);

  const {
    setUnsavedChange,
    device,
    handleSave,
    mapFetches,
    singleScreenBodyHeight,
    canvasWidth,
    singleScreenCanvasHeight,
  } = useContentPage();

  // SET UP DATA

  const { portfolioRoot } = useData();
  const { pageId: pageIdString } = useParams();
  const paramPageId = useMemo(() => Number(pageIdString), [pageIdString]);
  const imageComponentsRoot = useMemo(
    () =>
      portfolioRoot.data
        ? portfolioRoot.data.find((pageRoot) => pageRoot.id === paramPageId)
            .imageComponents
        : null,
    [paramPageId, portfolioRoot.data]
  );

  useLayoutEffect(() => {
    if (imageComponentsRoot) {
      setImageComponentsModified(imageComponentsRoot);
    }
  }, [imageComponentsRoot]);

  // HELPERS

  function handleSelectPosition(component) {
    const { x, y } = selectComponent(
      component.positions,
      device,
      'aspectRatio'
    );
    return {
      x: calcPercentageValue(x, canvasWidth),
      y: calcPercentageValue(y, singleScreenCanvasHeight),
    };
  }

  function hasError(component) {
    const orderErrorData = errors.find((error) => error.type === 'order');

    if (!orderErrorData) return false;

    const componentsWithOrderError = orderErrorData.components;

    return componentsWithOrderError.find(
      (componentWithOrderError) => componentWithOrderError.id === component.id
    );
  }

  // UPDATE MODIFIED DATA

  function handleUpdatePositionOrWidth(element, field, newValue) {
    setImageComponentsModified(
      produce((draft) => {
        const draftElement = findElement(element.id, draft);
        const fieldComponents = draftElement[field];
        const usedComponent = selectComponent(
          fieldComponents,
          device,
          'aspectRatio'
        );

        if (usedComponent.aspectRatio === device.aspectRatio) {
          deleteElement(usedComponent, fieldComponents, 'aspectRatio');
        }

        const newComponent = {};
        newComponent.aspectRatio = device.aspectRatio;

        if (field === 'positions') {
          newComponent.x = convertValueToPercent(newValue.x, canvasWidth);
          newComponent.y = convertValueToPercent(
            newValue.y,
            singleScreenCanvasHeight
          );
        } else {
          newComponent.value = newValue;
        }
        fieldComponents.push(newComponent);
      })
    );
    setUnsavedChange(true);
  }

  function handleUpdateOrderOrLayer(element, field, newValue) {
    setImageComponentsModified(
      produce((draft) => {
        const draftElement = findElement(element.id, draft);
        draftElement[field] = newValue;
      })
    );
    setUnsavedChange(true);
  }

  function handleAddImage(image) {
    const newElement = createImageComponent({
      id: uuidv4(),
      orderAndLayerValue: imageComponentsModified.length + 1,
      image,
      device,
      page: 'portfolio',
    });
    addElement(newElement, setImageComponentsModified);
    setUnsavedChange(true);
  }

  const handleDeleteElement = (active) =>
    confirmWrapper('delete', () => {
      setImageComponentsModified(
        produce((draft) => {
          deleteElement(active, draft);

          // process orders and layers
          sortByAscending(draft, 'order');
          draft.forEach((component, i) => {
            component.order = i + 1;

            if (component.layer > draft.length) {
              component.layer = draft.length;
            }
          });
        })
      );
      setControlUsed(null);
      setUnsavedChange(true);
    });

  const undoChanges = () =>
    confirmWrapper('undo', () => {
      setImageComponentsModified(imageComponentsRoot);
      setUnsavedChange(false);
    });

  function save() {
    const handleSaveResponses = (responses) =>
      processSaveResData(responses, portfolioRoot.setData);

    const processedImageComponents = rmTempFields(imageComponentsModified);
    const pageData = findElement(paramPageId, portfolioRoot.data);
    const updatedPage = produce(pageData, (draft) => {
      draft.imageComponents = processedImageComponents;
    });

    handleSave(
      [mapFetches([updatedPage], 'put', 'portfolio')],
      handleSaveResponses
    );
  }

  // DERIVED DATA

  const errors = useMemo(() => {
    if (imageComponentsModified?.length < 2) {
      return [];
    }
    const errors = [];

    const componentsWithOrderError = [];
    const componentsSorted = produce(imageComponentsModified, (draft) =>
      sortByAscending(draft, 'order')
    );
    for (let i = 0; i < componentsSorted.length; i++) {
      const order = componentsSorted[i].order;
      const nextOrder = componentsSorted[i + 1]?.order;
      if (!nextOrder) break;
      if (order === nextOrder) {
        componentsWithOrderError.push(componentsSorted[i]);
        componentsWithOrderError.push(componentsSorted[i + 1]);
        i++; // i++ definitely works?
      }
    }

    if (componentsWithOrderError.length) {
      errors.push({
        type: 'order',
        message: "Ensure no duplication of image 'orders'.",
        components: componentsWithOrderError,
      });
    }

    return errors;
  }, [imageComponentsModified]);

  return (
    <ContentPageWrapper
      controls={{
        addElements: [
          { text: 'image', func: () => setShowEditImagePopup(true) },
        ],
        device: true,
        undoChanges,
        save,
        back: { to: '/portfolio', name: 'portfolio landing' },
      }}
      errors={errors}
      editImagePopup={
        <EditImagePopup
          show={showEditImagePopup}
          close={() => setShowEditImagePopup(false)}
          handleImage={({ data }) => handleAddImage(data)}
        />
      }
    >
      <div
        css={[
          canvas,
          {
            width: canvasWidth,
            height: singleScreenCanvasHeight,
            top: (singleScreenBodyHeight - singleScreenCanvasHeight) / 2,
          },
        ]}
      >
        {imageComponentsModified[0] &&
          imageComponentsModified.map((component) => (
            <RndElement
              width={
                selectComponent(component.widths, device, 'aspectRatio').value
              }
              position={handleSelectPosition(component)}
              zIndex={imageComponentsModified.length - component.layer}
              updatePosition={(newValue) =>
                handleUpdatePositionOrWidth(component, 'positions', newValue)
              }
              updateWidth={(newValue) =>
                handleUpdatePositionOrWidth(component, 'widths', newValue)
              }
              disableDragging={controlUsed}
              enableResizing={{
                right: true,
                bottom: true,
                bottomRight: true,
              }}
              key={component.id}
            >
              <ImageElement
                src={selectImage(component.image.image, 'medium')}
                canvasWidth={canvasWidth}
                canvasHeight={singleScreenCanvasHeight}
                numberComponents={imageComponentsModified.length}
                order={component.order}
                layer={component.layer}
                updateOrder={(newValue) =>
                  handleUpdateOrderOrLayer(component, 'order', newValue)
                }
                updateLayer={(newValue) =>
                  handleUpdateOrderOrLayer(component, 'layer', newValue)
                }
                deleteElement={() => handleDeleteElement(component)}
                controlUsed={controlUsed}
                setControlUsed={setControlUsed}
                error={hasError(component)}
              />
            </RndElement>
          ))}
      </div>
    </ContentPageWrapper>
  );
}

function PortfolioPage() {
  return (
    <ContentPageProvider page="portfolio-page">
      <Content />
    </ContentPageProvider>
  );
}

export default PortfolioPage;
