/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useMemo, useReducer, useState } from 'react';
import produce from 'immer';

import { useData } from '../context/DataContext';
import {
  ContentPageProvider,
  useContentPage,
} from '../context/ContentPageContext';

import { filterNew, filterUpdated, filterArr1WithArr2 } from '../utils';
import {
  applyCorrectValueAndFlag,
  processSaveResData,
  rmTempFields,
} from '../utils/processData';
import {
  interpretMultipleFetchStatuses,
  confirmWrapper,
  selectComponent,
  createTemporaryUniqueId,
  addElement,
  deleteElement,
} from '../utils/contentPageUtils';

import ContentPageWrapper from '../components/common/ContentPageWrapper';
import SortableDndContext from '../components/common/SortableDndContext';
import PressElement from '../components/press/PressElement';
import SortableElement from '../components/common/SortableElement';
import EditImagePopup from '../components/common/EditImagePopup';
import EditTextPopup from '../components/press/EditTextPopup';

import { canvasDefault } from '../components/common/styles';
import PageFold from '../components/common/PageFold';

const canvas = css(canvasDefault, {
  // margin: '200px auto  0px',
  paddingTop: 1, // strange behaviour. When don't have padding here, margins in pressElementsContainer have no affect.
  paddingBottom: 1,
  marginTop: 200,
  marginLeft: '50%',
  transform: 'translateX(-50%)',
});

const pressElementsContainer = css({
  display: 'grid',
  gridGap: 10,
  width: '90%',
  marginTop: 100,
  marginBottom: 100,
  marginLeft: '50%',
  transform: 'translateX(-50%)',
});

const placeHolderElementStyle = css({
  '::before': {
    content: '" "',
    display: 'block',
    width: '100%',
    height: 0,
    paddingTop: '100%',
  },
});

/* NOTES
  - pressperrow should be by device width not aspect ratio!! change Strapi schema
*/

const editedElementIdleState = { type: null, element: null };

function editedElementReducer(_, { type, element }) {
  switch (type) {
    case 'image':
      return { type, element };
    case 'text':
      return { type, element };
    case 'close':
      return editedElementIdleState;
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

function Content() {
  const [pressModified, setPressModified] = useState([]);
  const [pressPerRowModified, setPressPerRowModified] = useState(null);
  const [editedElement, editedElementDispatch] = useReducer(
    editedElementReducer,
    editedElementIdleState
  );

  const {
    singleScreenBodyHeight,
    canvasWidth,
    singleScreenCanvasHeight,
    setUnsavedChange,
    device,
    handleSave,
    mapFetches,
  } = useContentPage();

  // HANDLE ROOT DATA

  const { pressRoot, pressPerRowRoot } = useData();

  useLayoutEffect(() => {
    if (pressRoot.data) {
      setPressModified(pressRoot.data);
    }
  }, [pressRoot.data]);

  useLayoutEffect(() => {
    if (pressPerRowRoot.data) {
      const pressPerRowModified = pressPerRowRoot.data[0]
        ? pressPerRowRoot.data
        : [{ width: 1920, value: 5, new: true }];
      setPressPerRowModified(pressPerRowModified);
    }
  }, [pressPerRowRoot.data]);

  const rootDataFetchStatus = useMemo(
    () =>
      interpretMultipleFetchStatuses(
        pressRoot.fetchStatus,
        pressPerRowRoot.fetchStatus
      ),
    [pressRoot.fetchStatus, pressPerRowRoot.fetchStatus]
  );

  const resetRootDataFetch = () => {
    pressRoot.resetFetch();
    pressPerRowRoot.resetFetch();
  };

  // SET UP CANVAS

  const elementsPerRow = useMemo(
    () =>
      device && pressPerRowModified
        ? selectComponent(pressPerRowModified, device, 'width').value
        : null,
    [device, pressPerRowModified]
  );

  const placeHolderElements = useMemo(() => {
    if (pressModified && elementsPerRow && device) {
      const numElements = pressModified.length;

      let totalNumElements = 0;
      while (totalNumElements < numElements) {
        totalNumElements += elementsPerRow;
      }

      const numEmptyElements = totalNumElements - numElements;
      let placeholderArray = [];
      for (let i = 0; i < numEmptyElements; i++) {
        placeholderArray.push({ id: 'placeholder-' + i, placeholder: true });
      }

      return placeholderArray;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, pressModified]);

  // UPDATE MODIFIED DATA

  function updateElementField(field, newValue) {
    setPressModified(
      produce((draft) => {
        const editedElementId = editedElement.element.id;
        const draftElementToUpdate = draft.find(
          (element) => element.id === editedElementId
        );
        draftElementToUpdate[field] = newValue;
        draftElementToUpdate.updated = true;
      })
    );
    setUnsavedChange(true);
  }

  function handleAddElement() {
    const newElement = {
      id: createTemporaryUniqueId([...pressRoot.data, ...pressModified]),
      title: null,
      linkUrl: null,
      image: null,
      new: true,
    };
    addElement(newElement, setPressModified);
    setUnsavedChange(true);
  }

  function handleDeleteElement(element) {
    confirmWrapper('delete', () => {
      setPressModified(produce((draft) => deleteElement(element, draft)));
      setUnsavedChange(true);
    });
  }

  function updateElementsPerRow(newValue) {
    setPressPerRowModified(
      produce((draft) => {
        const currentComponent = selectComponent(draft, device, 'width');
        if (device.width === currentComponent.width) {
          currentComponent.value = newValue;
          currentComponent.updated = true;
        } else {
          const newComponent = {
            width: device.width,
            value: newValue,
            new: true,
          };
          draft.push(newComponent);
        }
      })
    );
    setUnsavedChange(true);
  }

  function undoChanges() {
    confirmWrapper('undo', () => {
      setPressModified(pressRoot.data);
      setPressPerRowModified(pressPerRowRoot.data);
      setUnsavedChange(false);
    });
  }

  function save() {
    function handleSaveResponse(responses) {
      const pressElementResponses = responses.filter(
        (res) => !res.config.url.includes('per-rows')
      );
      const pressPerRowResponses = responses.filter((res) =>
        res.config.url.includes('per-rows')
      );

      processSaveResData(pressElementResponses, pressRoot.setData);
      processSaveResData(pressPerRowResponses, pressPerRowRoot.setData);
    }

    const processedElements = produce(pressModified, (draft) => {
      draft.forEach((element, i) =>
        applyCorrectValueAndFlag(element, 'order', i)
      );
    });

    const newElements = filterNew(processedElements);
    const newElementsProcessed = rmTempFields(newElements);
    const updatedElements = filterUpdated(processedElements);
    const updatedElementsProcessed = rmTempFields(updatedElements);
    const deletedElements = filterArr1WithArr2(
      pressRoot.data,
      pressModified,
      'excludes'
    );

    const newElsPerRow = filterNew(pressPerRowModified);
    const updatedElsPerRow = filterUpdated(pressPerRowModified);

    handleSave(
      [
        mapFetches(newElementsProcessed, 'post', 'press'),
        mapFetches(updatedElementsProcessed, 'put', 'press'),
        mapFetches(deletedElements, 'delete', 'press'),
        mapFetches(newElsPerRow, 'post', 'pressElementsPerRow'),
        mapFetches(updatedElsPerRow, 'put', 'pressElementsPerRow'),
      ],
      handleSaveResponse
    );
  }

  return (
    <ContentPageWrapper
      rootDataFetchStatus={rootDataFetchStatus}
      resetRootDataFetch={resetRootDataFetch}
      controls={{
        addElements: [{ text: 'element', func: handleAddElement }],
        elementsPerRow: {
          value: elementsPerRow,
          update: updateElementsPerRow,
        },
        device: true,
        undoChanges,
        save,
      }}
      editImagePopup={
        <EditImagePopup
          show={editedElement.type === 'image'}
          close={() => editedElementDispatch({ type: 'close' })}
          handleImage={({ data }) => updateElementField('image', data)}
        />
      }
      editTextPopup={
        <EditTextPopup
          show={editedElement.type === 'text'}
          close={() => editedElementDispatch({ type: 'close' })}
          element={editedElement.element}
          updateElement={updateElementField}
        />
      }
    >
      {singleScreenBodyHeight && canvasWidth && singleScreenCanvasHeight && (
        <div
          css={[
            canvas,
            {
              width: canvasWidth,
              minHeight: singleScreenCanvasHeight,
              top: (singleScreenBodyHeight - singleScreenCanvasHeight) / 2,
            },
          ]}
        >
          {pressModified[0] && elementsPerRow && (
            <div
              css={[
                pressElementsContainer,
                { gridTemplateColumns: `repeat(${elementsPerRow}, 1fr)` },
              ]}
            >
              <SortableDndContext
                items={pressModified.map((element) => element.id)}
                updateData={setPressModified}
                setUnsavedChange={setUnsavedChange}
              >
                {pressModified.map((element) => (
                  <SortableElement element={element} key={element.id}>
                    <PressElement
                      element={element}
                      editElementText={() =>
                        editedElementDispatch({ type: 'text', element })
                      }
                      editElementImage={() =>
                        editedElementDispatch({ type: 'image', element })
                      }
                      deleteElement={() => handleDeleteElement(element)}
                    />
                  </SortableElement>
                ))}
              </SortableDndContext>
              {placeHolderElements.map((element) => (
                <div css={placeHolderElementStyle} key={element.id} />
              ))}
            </div>
          )}
          <PageFold top={singleScreenCanvasHeight} />
        </div>
      )}
    </ContentPageWrapper>
  );
}

function Press() {
  return (
    <ContentPageProvider page="press">
      <Content />
    </ContentPageProvider>
  );
}

export default Press;
