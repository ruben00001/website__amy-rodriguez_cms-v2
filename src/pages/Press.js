/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

import ControlPanel from '../components/common/ControlPanel';
import PressDndContext from '../components/press/PressDndContext';
import PressElement from '../components/press/PressElement';
import { devices } from '../constants';
import { useData } from '../context/DataContext';
import useCanvasSize from '../hooks/useCanvasSize';
import EditElementTextPopup from '../components/press/EditElementTextPopup';
import produce from 'immer';
import EditImagePopup from '../components/press/EditImagePopup';
import { confirmWrapper, createTemporaryUniqueId } from '../utils';
// import useSavePress from '../hooks/useSavePress';
import LoadingOverlay from '../components/common/LoadingOverlay';
import useAsync from '../hooks/useAsync';
import axios from 'axios';
import {
  applyCorrectValueAndFlag,
  filterArr1WithArr2,
  filterResponses,
  rmTempFields,
} from '../utils/processData';
import { useFetch } from '../context/FetchContext';
import LoadingBar from '../components/common/LoadingBar';

const container = (theme) =>
  css({
    position: 'relative',
    minHeight: '100vh',
    overflowX: 'hidden',
    backgroundColor: theme.colors.verylightgrey,
  });

const body = (theme) =>
  css({
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.colors.verylightgrey,
    width: '100%',
  });

const canvas = css({
  position: 'relative',
  backgroundColor: 'white',
  boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 200,
});

// change color and border color
const pageFold = css({
  borderTop: '2px dashed #e8e8e8',
  position: 'absolute',
  height: 2,
  width: '100%',

  p: {
    position: 'absolute',
    right: '-5px',
    fontSize: 10,
    transform: 'translate(100%, -50%)',

    color: '#999999',
  },
});

const pressElementsContainer = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignContent: 'flex-start',
  flexWrap: 'wrap',
  width: '90%',
  margin: '100px auto',
});

/* NOTES
  - I don't think numElements per row is predictable as it currently is set up
  - images need to be fetched too (for popup to work - so not necessary for all to work)
  - highlight if an element doesn't have needed info and maybe mention won't be saved
*/

function Press() {
  const [elementsModified, setElementsModified] = useState([]);
  const [placeHolderElements, setPlaceHolderElements] = useState(null);
  const [deviceNum, setDeviceNum] = useState(0);
  const device = useMemo(() => devices[deviceNum], [deviceNum]);
  const [unsavedChange, setUnsavedChange] = useState(false);
  const [editedElementText, setEditedElementText] = useState(null);
  const [editedElementImage, setEditedElementImage] = useState(null);

  const { authFetch, strapiEndpoints } = useFetch();
  const { status: saveStatus, run: runSave } = useAsync();

  useEffect(() => {
    if (elementsModified) console.log('elementsModified:', elementsModified);
  }, [elementsModified]);

  // SET UP DATA
  const {
    pressRoot,
    setPressRoot,
    pressFetchStatus,
    resetPressFetch,
  } = useData();

  useLayoutEffect(() => {
    if (pressRoot) {
      setElementsModified(pressRoot);
    }
  }, [pressRoot]);

  useLayoutEffect(() => {
    if (elementsModified && device) {
      let numElementsPerRow = switchElementsPerRow(device.width);
      const numElements = elementsModified.length;

      let totalNumElements = 0;
      while (totalNumElements < numElements) {
        totalNumElements += numElementsPerRow;
      }

      const numEmptyElements = totalNumElements - numElements;
      let placeholderArray = [];
      for (let i = 0; i < numEmptyElements; i++) {
        placeholderArray.push({ id: 'placeholder-' + i, placeholder: true });
      }

      setPlaceHolderElements(placeholderArray);
    }
  }, [elementsModified, device]);

  // SET UP CANVAS

  const controlPanelRef = useRef(null);
  const bodyHeight = useMemo(
    () =>
      controlPanelRef?.current &&
      window.innerHeight - controlPanelRef.current.offsetHeight,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlPanelRef.current]
  );
  const { width: canvasWidth, height: canvasHeightOnePage } = useCanvasSize({
    parentWidth: document.body.clientWidth,
    parentHeight: bodyHeight,
    device: device,
  });

  // UPDATE DATA

  function addElement() {
    setElementsModified(
      produce((draft) => {
        const newElement = {
          id: createTemporaryUniqueId(draft),
          title: null,
          linkUrl: null,
          image: null,
          new: true,
        };

        draft.push(newElement);
      })
    );
  }

  function updateElementField(field, newValue) {
    setElementsModified(
      produce((draft) => {
        const editedElementId =
          field === 'image' ? editedElementImage.id : editedElementText.id;
        const draftElementToUpdate = draft.find(
          (element) => element.id === editedElementId
        );
        draftElementToUpdate[field] = newValue;
        draftElementToUpdate.updated = true;
      })
    );
    setUnsavedChange(true);
  }

  function deleteElement(elementToDelete) {
    function payload() {
      setElementsModified(
        produce((draft) => {
          const elementIndex = draft.findIndex(
            (element) => element.id === elementToDelete.id
          );
          draft.splice(elementIndex, 1);
        })
      );
      setUnsavedChange(true);
    }

    const confirmMessage = 'Are you sure you want to delete this entry?';

    confirmWrapper(confirmMessage, payload);
  }

  function undoAllChanges() {
    function payload() {
      setElementsModified(pressRoot);
      setUnsavedChange(false);
    }
    const confirmMessage =
      'Any unsaved work will be lost. Are you sure you want to undo all changes?';

    confirmWrapper(confirmMessage, payload);
  }

  function save() {
    function processData(res) {
      // change this as now using setState
      const postResponses = filterResponses(res, 'post');
      const putResponses = filterResponses(res, 'put');
      const deleteResponses = filterResponses(res, 'delete');

      const updatedRootData = produce(pressRoot, (draft) => {
        postResponses.forEach((res) => draft.push(res.data));

        putResponses.forEach((res) => {
          const data = res.data;
          const draftIndex = draft.findIndex(
            (element) => element.id === data.id
          );
          draft.splice(draftIndex, 1, data);
        });

        deleteResponses.forEach((res) => {
          const data = res.data;
          const draftIndex = draft.findIndex(
            (element) => element.id === data.id
          );
          draft.splice(draftIndex, 1);
        });

        draft.sort((a, b) => a.order - b.order);
      });

      setPressRoot(updatedRootData);
    }

    const validElements = elementsModified.filter(
      (element) => element.title && element.linkUrl && element.image
    );
    const newElements = validElements.filter((element) => element.new);
    const newElementsProcessed = rmTempFields(newElements);

    // applyCorrectValueAndFlag application here has changed and is wrong here!
    const elementsReordered = applyCorrectValueAndFlag(validElements);
    const updatedElements = elementsReordered.filter(
      (element) => element.updated
    );
    const updatedElementsProcessed = rmTempFields(updatedElements);

    const deletedElements = filterArr1WithArr2(pressRoot, elementsModified);

    runSave(
      axios.all(
        [
          newElementsProcessed.map((element) =>
            authFetch.post(strapiEndpoints.press, element)
          ),
          updatedElementsProcessed.map((element) =>
            authFetch.put(`${strapiEndpoints.press}/${element.id}`, element)
          ),
          deletedElements.map((element) =>
            authFetch.delete(`${strapiEndpoints.press}/${element.id}`)
          ),
        ].flat()
      ),
      processData
    );
  }

  // HELPERS

  function switchElementsPerRow(deviceWidth) {
    switch (true) {
      case deviceWidth > 1000:
        return 5;
      case deviceWidth > 700:
        return 4;
      case deviceWidth > 400:
        return 3;
      default:
        return 2;
    }
  }

  return (
    <div css={container}>
      {pressFetchStatus !== 'complete' && (
        <LoadingOverlay
          page="press"
          fetchStatus={pressFetchStatus}
          fetchData={resetPressFetch}
        />
      )}
      <ControlPanel
        position="fixed"
        addPressElement={addElement}
        setDevice={setDeviceNum}
        unsavedChange={unsavedChange}
        undoAllChanges={undoAllChanges}
        save={save}
        fetchStatus={saveStatus}
        ref={controlPanelRef}
      />
      {controlPanelRef.current && (
        <div
          css={[
            body,
            {
              top: controlPanelRef.current.offsetHeight,
            },
          ]}
        >
          {canvasWidth && canvasHeightOnePage && (
            <div
              css={[
                canvas,
                {
                  width: canvasWidth,
                  minHeight: canvasHeightOnePage,
                  marginTop: (bodyHeight - canvasHeightOnePage) / 2,
                },
              ]}
            >
              <div css={[pageFold, { top: canvasHeightOnePage }]}>
                <p>Page fold</p>
              </div>
              <div css={pressElementsContainer}>
                <PressDndContext
                  updateData={setElementsModified}
                  setUnsavedChange={setUnsavedChange}
                >
                  {typeof elementsModified === 'object' && (
                    <SortableContext
                      items={elementsModified.map((element) => element.id)}
                      strategy={rectSortingStrategy}
                    >
                      {elementsModified.map((element) => (
                        <PressElement
                          element={element}
                          canvasWidth={canvasWidth}
                          editElementText={() => setEditedElementText(element)}
                          editElementImage={() =>
                            setEditedElementImage(element)
                          }
                          deleteElement={() => deleteElement(element)}
                          key={element.id}
                        />
                      ))}
                    </SortableContext>
                  )}
                </PressDndContext>
                {placeHolderElements.map((element) => (
                  <div
                    css={{
                      width: canvasWidth / 6,
                      height: canvasWidth / 6,
                    }}
                    key={element.id}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {editedElementText && (
        <EditElementTextPopup
          close={() => setEditedElementText(null)}
          element={editedElementText}
          updateElement={updateElementField}
        />
      )}
      {editedElementImage && (
        <EditImagePopup
          close={() => setEditedElementImage(null)}
          editImage={(newImage) => updateElementField('image', newImage)}
        />
      )}
    </div>
  );
}

export default Press;
