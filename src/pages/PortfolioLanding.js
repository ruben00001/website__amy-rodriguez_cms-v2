/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useState } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import produce from 'immer';

import { useData } from '../context/DataContext';
import InitialLoadingDataOverlay from '../components/common/InitialLoadingDataOverlay';
import ControlPanel from '../components/common/ControlPanel';
import OverviewPage from '../components/portfolio/OverviewPage';
import { PageNumbers } from '../components/portfolio/PageNumbers';
import PortfolioPage from './PortfolioPage';
import ApiRequestOverlay from '../components/common/ApiRequestOverlay';
import useSavePortfolio from '../hooks/useSavePortfolio';
import { createTemporaryUniqueId } from '../utils';
import PortfolioLandingDndContext from '../components/portfolio/PortfolioLandingDndContext';
import useLeavePageWarning from '../hooks/useLeavePageWarning';
import RouterPrompt from '../components/common/RouterPrompt';

const container = css({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const body = (theme) =>
  css({
    display: 'flex',
    justifyContent: 'space-evenly',
    alignContent: 'flex-start',
    backgroundColor: theme.colors.verylightgrey,
    flexGrow: 1,
    flexWrap: 'wrap',
    padding: '10vh 0 5vh',
    overflowX: 'hidden',
  });

function PortfolioLanding() {
  const [portfolioDataModified, setPortfolioDataModified] = useState(null);
  const [unsavedChange, setUnsavedChange] = useState(false);

  const {
    status: rootDataFetchStatus,
    portfolio: portfolioDataRoot,
  } = useData();

  useLayoutEffect(() => {
    if (portfolioDataRoot) {
      setPortfolioDataModified(portfolioDataRoot);
    }
  }, [portfolioDataRoot]);

  useLeavePageWarning(unsavedChange);

  const { save, status: saveStatus } = useSavePortfolio(setUnsavedChange);

  function addPage() {
    setPortfolioDataModified(
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
  }

  function deletePage(id) {
    const confirmRes = window.confirm(
      'Are you sure you want to delete this page?'
    );
    if (confirmRes) {
      setPortfolioDataModified(
        produce((draft) => {
          const pageToDeleteId = id;
          const pageToDeleteIndex = draft.findIndex(
            (page) => page.id === pageToDeleteId
          );
          draft.splice(pageToDeleteIndex, 1);
        })
      );
    }
    setUnsavedChange(true);
  }

  function undoAllChanges() {
    const confirmRes = window.confirm(
      'Any unsaved work will be lost. Are you sure you want to undo all changes?'
    );
    if (confirmRes) {
      setPortfolioDataModified(portfolioDataRoot);
      setUnsavedChange(false);
    }
  }

  return (
    <div css={container}>
      {rootDataFetchStatus !== 'complete' && (
        <InitialLoadingDataOverlay status={rootDataFetchStatus} />
      )}
      {/* probs shouldn't have multiple overlays */}
      <ApiRequestOverlay status={saveStatus} />
      <ControlPanel
        position="fixed"
        addPage={addPage}
        save={() => save(portfolioDataModified)}
        unsavedChange={unsavedChange}
        undoAllChanges={undoAllChanges}
      />
      {portfolioDataModified && (
        <PortfolioLandingDndContext
          portfolioDataModified={portfolioDataModified}
          setPortfolioDataModified={setPortfolioDataModified}
          setUnsavedChange={setUnsavedChange}
        >
          <div css={body}>
            {portfolioDataModified.map((page) => (
              <OverviewPage
                data={page}
                deletePage={() => deletePage(page.id)}
                unsavedChange={unsavedChange}
                key={page.id}
              />
            ))}
            <PageNumbers />
          </div>
        </PortfolioLandingDndContext>
      )}
      <RouterPrompt unsavedChange={unsavedChange} />
    </div>
  );
}

function Portfolio() {
  const { path } = useRouteMatch();
  const { portfolio: portfolioDataRoot } = useData();

  return (
    <Switch>
      <Route exact path={path}>
        <PortfolioLanding />
      </Route>
      {portfolioDataRoot && (
        <Route path={`${path}/:pageId`}>
          <PortfolioPage />
        </Route>
      )}
      <Route render={() => <Redirect to="/portfolio" />} />
    </Switch>
  );
}

export default Portfolio;
