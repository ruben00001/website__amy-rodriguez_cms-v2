/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useState } from 'react';
import produce from 'immer';
import { v4 as uuidv4 } from 'uuid';

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
  addElement,
  confirmWrapper,
  deleteElement,
} from '../utils/contentPageUtils';
import {
  applyCorrectValueAndFlag,
  processSaveResData,
  rmTempFields,
} from '../utils/processData';

import ContentPageWrapper from '../components/common/ContentPageWrapper';
import SortableDndContext from '../components/common/SortableDndContext';
import SortableElement from '../components/common/SortableElement';
import PageElement from '../components/portfolio-landing/PageElement';
import PageNumbers from '../components/portfolio-landing/PageNumbers';

const body = css({
  display: 'flex',
  justifyContent: 'space-evenly',
  alignContent: 'flex-start',
  flexWrap: 'wrap',
  padding: '10vh 0 10vh',
  overflowX: 'hidden',
});

function Content() {
  const [portfolioModified, setPortfolioModified] = useState([]);

  const { setUnsavedChange, handleSave, mapFetches } = useContentPage();

  const { portfolioRoot } = useData();

  useLayoutEffect(() => {
    if (!portfolioRoot.data) return;
    setPortfolioModified(portfolioRoot.data);
  }, [portfolioRoot.data]);

  function addPage() {
    const newComponent = {
      id: uuidv4(),
      imageComponents: [],
      order: portfolioModified.length + 1,
      new: true,
    };
    addElement(newComponent, setPortfolioModified);

    setUnsavedChange(true);
    scrollToBottom();
  }

  const deletePage = (active) =>
    confirmWrapper('delete', () => {
      setPortfolioModified(
        produce((draft) => {
          deleteElement(active, draft);
        })
      );
      setUnsavedChange(true);
    });

  const undoChanges = () =>
    confirmWrapper('undo', () => {
      setPortfolioModified(portfolioRoot.data);
      setUnsavedChange(false);
    });

  function save() {
    const handleSaveResponse = (responses) =>
      processSaveResData(responses, portfolioRoot.setData);

    const processedElements = produce(portfolioModified, (draft) => {
      draft.forEach((element, i) =>
        applyCorrectValueAndFlag(element, 'order', i)
      );
    });

    const newElements = filterNew(processedElements);
    const newElementsProcessed = rmTempFields(newElements);
    const updatedElements = filterUpdated(processedElements);
    const deletedElements = filterArr1WithArr2(
      portfolioRoot.data,
      portfolioModified,
      'excludes'
    );

    handleSave(
      [
        mapFetches(newElementsProcessed, 'post', 'portfolio'),
        mapFetches(updatedElements, 'put', 'portfolio'),
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
      <div css={body}>
        {portfolioModified[0] && (
          <SortableDndContext
            items={portfolioModified.map((element) => element.id)}
            updateData={setPortfolioModified}
            setUnsavedChange={setUnsavedChange}
          >
            {portfolioModified.map((page, i) => (
              <SortableElement element={page} key={page.id}>
                <PageElement
                  data={page}
                  index={i}
                  deletePage={() => deletePage(page)}
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
