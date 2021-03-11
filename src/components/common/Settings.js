/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { faCommentAlt } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import produce from 'immer';
import { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useFetch } from '../../context/FetchContext';
import useAsync from '../../hooks/useAsync';
import { button } from './styles';

const container = css({
  zIndex: 500,
  position: 'fixed',
  bottom: 5,
  right: 10,
  opacity: 0.9,
});

const menu = css({
  position: 'absolute',
  bottom: 8,
  right: 0,
  transform: 'translateY(-100%)',

  button: {
    border: '1px solid black',
    borderRadius: 2,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',

    p: {
      whiteSpace: 'nowrap',
      marginRight: 10,
    },
  },
});

const commentIcon = css({
  transform: 'rotate(180deg)',
});

const settingsSavedStyle = css({
  position: 'absolute',
  left: -10,
  bottom: 0,
  transform: 'translateX(-100%)',
  backgroundColor: 'black',
  color: 'white',
  whiteSpace: 'nowrap',
  padding: '3px 6px',
  fontSize: 12,
  borderRadius: 2,
  opacity: 0.9,
});

function Settings() {
  const [show, setShow] = useState(false);
  const [toggleSettingsUpdate, setToggleSettingsUpdate] = useState(false);

  const { settingsRoot } = useData();
  const tooltips = settingsRoot?.data?.tooltips;
  const { run: runSave, status: saveStatus } = useAsync();

  const { authFetch, strapiEndpoints } = useFetch();

  useEffect(() => {
    if (toggleSettingsUpdate) {
      async function saveSettings(newValue) {
        runSave(authFetch.put(`${strapiEndpoints.settings}`, newValue));
      }
      const tooltipsCopy = produce(tooltips, (draft) => draft);

      setToggleSettingsUpdate(false);
      settingsRoot.setData(
        produce((draft) => {
          draft.tooltips = !tooltipsCopy;
        })
      );
      saveSettings({ tooltips: !tooltipsCopy });
    }
  }, [
    authFetch,
    runSave,
    settingsRoot,
    strapiEndpoints.settings,
    toggleSettingsUpdate,
    tooltips,
  ]);

  return (
    <div css={container}>
      <FontAwesomeIcon
        css={button}
        icon={faCogs}
        onClick={() => setShow((show) => !show)}
      />
      <div css={[menu, !show && { opacity: 0 }]}>
        <button css={button} onClick={() => setToggleSettingsUpdate(true)}>
          <p>{tooltips ? 'Turn off tooltips' : 'Turn on tooltips'}</p>
          <FontAwesomeIcon css={commentIcon} icon={faCommentAlt} />
        </button>
      </div>
      {(saveStatus === 'resolved' || saveStatus === 'rejected') && (
        <p css={settingsSavedStyle}>
          {saveStatus === 'resolved'
            ? 'Settings saved'
            : 'Oops...Something went wrong saving settings. Try again'}
        </p>
      )}
    </div>
  );
}

export default Settings;
