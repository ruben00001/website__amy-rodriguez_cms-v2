/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useState } from 'react';
import produce from 'immer';

import { useData } from '../context/DataContext';
import {
  ContentPageProvider,
  useContentPage,
} from '../context/ContentPageContext';

import {
  filterNew,
  filterUpdated,
  filterArr1WithArr2,
  scrollToBottom,
} from '../utils';
import {
  confirmWrapper,
  createTemporaryUniqueId,
} from '../utils/contentPageUtils';
import {
  applyCorrectValueAndFlag,
  processSaveResData,
  rmTempFields,
} from '../utils/processData';

import ContentPageWrapper from '../components/common/ContentPageWrapper';
import SortableDndContext from '../components/common/SortableDndContext';
import SortableElement from '../components/common/SortableElement';
import PortfolioElement from '../components/portfolio-landing/PortfolioElement';
import PageNumbers from '../components/portfolio-landing/PageNumbers';

const container = css({
  display: 'flex',
  justifyContent: 'space-evenly',
  alignContent: 'flex-start',
  flexWrap: 'wrap',
  padding: '10vh 0 5vh',
  overflowX: 'hidden',
});

/* NOTES
    - routes should be seperate? In own folder/app.js
  */

function Content() {
  const [portfolioModified, setPortfolioModified] = useState([]);

  const { setUnsavedChange, handleSave, mapFetches } = useContentPage();

  const { portfolioRoot } = useData();

  useLayoutEffect(() => {
    if (portfolioRoot.data) {
      setPortfolioModified(portfolioRoot.data);
    }
  }, [portfolioRoot.data]);

  function addPage() {
    setPortfolioModified(
      produce((draft) => {
        const newPageId = createTemporaryUniqueId(draft);
        const newPageComponent = {
          id: newPageId,
          imageComponents: [],
          order: draft.length + 1,
          new: true,
        };
        draft.push(newPageComponent);
      })
    );
    setUnsavedChange(true);
    scrollToBottom();
  }

  function deletePage(id) {
    confirmWrapper('delete', () => {
      setPortfolioModified(
        produce((draft) => {
          const pageToDeleteId = id;
          const pageToDeleteIndex = draft.findIndex(
            (page) => page.id === pageToDeleteId
          );
          draft.splice(pageToDeleteIndex, 1);
        })
      );
      setUnsavedChange(true);
    });
  }

  function undoChanges() {
    confirmWrapper('undo', () => {
      setPortfolioModified(portfolioRoot.data);
      setUnsavedChange(false);
    });
  }

  function save() {
    function handleSaveResponse(responses) {
      processSaveResData(responses, portfolioRoot.setData);
    }

    const processedElements = produce(portfolioModified, (draft) => {
      draft.forEach((element, i) =>
        applyCorrectValueAndFlag(element, 'order', i)
      );
    });

    const newElements = filterNew(processedElements);
    const newElementsProcessed = rmTempFields(newElements);
    const updatedElements = filterUpdated(processedElements);
    const updatedElementsProcessed = rmTempFields(updatedElements);
    const deletedElements = filterArr1WithArr2(
      portfolioRoot.data,
      portfolioModified,
      'excludes'
    );

    handleSave(
      [
        mapFetches(newElementsProcessed, 'post', 'portfolio'),
        mapFetches(updatedElementsProcessed, 'put', 'portfolio'),
        mapFetches(deletedElements, 'delete', 'portfolio'),
      ],
      handleSaveResponse
    );
  }

  return (
    <ContentPageWrapper
      rootDataFetchStatus={portfolioRoot.fetchStatus}
      resetRootDataFetch={portfolioRoot.resetFetch}
      controls={{
        addElements: [{ text: 'page', func: addPage }],
        undoChanges,
        save,
      }}
    >
      <div css={container}>
        {portfolioModified[0] && (
          <SortableDndContext
            items={portfolioModified.map((element) => element.id)}
            updateData={setPortfolioModified}
            setUnsavedChange={setUnsavedChange}
          >
            {portfolioModified.map((page) => (
              <SortableElement element={page} key={page.id}>
                <PortfolioElement
                  data={page}
                  deletePage={() => deletePage(page.id)}
                />
              </SortableElement>
            ))}
          </SortableDndContext>
        )}
        {portfolioModified.length > 3 && (
          <PageNumbers numberPages={portfolioModified.length} />
        )}
      </div>
    </ContentPageWrapper>
  );
}

function PortfolioLanding() {
  return (
    <ContentPageProvider page="portfolio-landing">
      <Content />
    </ContentPageProvider>
  );
}

export default PortfolioLanding;
