/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { useLayoutEffect, useState } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import produce from 'immer';

import { useData } from '../context/DataContext';
import useSavePortfolio from '../hooks/useSavePortfolio';
import { createTemporaryUniqueId, scrollToBottom } from '../utils';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ControlPanel from '../components/common/ControlPanel';
import OverviewPage from '../components/portfolio/OverviewPage';
import { PageNumbers } from '../components/portfolio/PageNumbers';
import PortfolioPage from './PortfolioPage';
import PortfolioLandingDndContext from '../components/portfolio/PortfolioLandingDndContext';
import useLeavePageWarning from '../hooks/useLeavePageWarning';
import RouterPrompt from '../components/common/RouterPrompt';
import LoadingBar from '../components/common/LoadingBar';
import { fetchDisable } from '../components/common/styles';
import Settings from '../components/common/Settings';

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
  const [portfolioModified, setPortfolioModified] = useState([]);
  const [unsavedChange, setUnsavedChange] = useState(false);

  const {
    portfolioRoot,
    portfolioFetchStatus,
    updatePortfolioRoot,
    resetPortfolioFetch,
  } = useData();

  useLayoutEffect(() => {
    if (portfolioRoot) {
      setPortfolioModified(portfolioRoot);
    }
  }, [portfolioRoot]);

  useLeavePageWarning(unsavedChange);

  const { save, status: saveStatus } = useSavePortfolio(setUnsavedChange);

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
    const confirmRes = window.confirm(
      'Are you sure you want to delete this page?'
    );
    if (confirmRes) {
      setPortfolioModified(
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
      setPortfolioModified(portfolioRoot);
      setUnsavedChange(false);
    }
  }

  return (
    <div css={container}>
      {portfolioFetchStatus !== 'complete' && (
        <LoadingOverlay
          page="portfolio"
          fetchStatus={portfolioFetchStatus}
          fetchData={resetPortfolioFetch}
        />
      )}
      {/* <LoadingBar status={saveStatus} /> */}
      <ControlPanel
        position="fixed"
        addPage={addPage}
        save={() => save(portfolioModified)}
        unsavedChange={unsavedChange}
        undoAllChanges={undoAllChanges}
        fetchStatus={saveStatus}
      />
      {portfolioModified && (
        <PortfolioLandingDndContext
          portfolioModified={portfolioModified}
          setPortfolioModified={setPortfolioModified}
          setUnsavedChange={setUnsavedChange}
        >
          <div css={[body, saveStatus !== 'idle' && fetchDisable]}>
            {portfolioModified.map((page) => (
              <OverviewPage
                data={page}
                deletePage={() => deletePage(page.id)}
                unsavedChange={unsavedChange}
                key={page.id}
              />
            ))}
            {portfolioModified.length > 3 && (
              <PageNumbers numberPages={portfolioModified.length} />
            )}
          </div>
        </PortfolioLandingDndContext>
      )}
      {/* <Settings /> */}
      <RouterPrompt unsavedChange={unsavedChange} />
    </div>
  );
}

function Portfolio() {
  const { path } = useRouteMatch();
  const { portfolioRoot } = useData();

  return (
    <Switch>
      <Route exact path={path}>
        <PortfolioLanding />
      </Route>
      {portfolioRoot && (
        <Route path={`${path}/:pageId`}>
          <PortfolioPage />
        </Route>
      )}
      <Route render={() => <Redirect to="/portfolio" />} />
    </Switch>
  );
}

export default Portfolio;
