/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader';

const container = (theme) =>
  css({
    zIndex: 1000,
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.loadingOverlay,
  });

const content = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '40%',
  minHeight: '40vw',
  backgroundColor: 'white',
});

const title = css({
  fontWeight: 500,
  fontSize: 21,
  marginTop: 80,
});

const description = css({
  marginTop: 20,
});

const transitionOut = css({
  opacity: 0,
  transition: 'opacity 0.3s ease-out',
});

const transitionIn = css({
  opacity: 1,
  transition: 'opacity 0.3s ease-in',
});

const done = (theme) =>
  css({
    display: 'flex',
    alignItems: 'center',
    fontSize: 30,
    color: theme.colors.green,
    opacity: 0,
  });

const check = css({
  fontSize: 30,
  marginRight: 20,
});

function InitialLoadingDataOverlay({ status }) {
  return (
    <div css={container}>
      <div css={content}>
        <div css={status === 'resolved' && transitionOut}>
          <ClimbingBoxLoader size={25} />
        </div>
        <div css={[done, status === 'resolved' && transitionIn]}>
          <FontAwesomeIcon icon={faCheck} css={check} />
          <p>Done</p>
        </div>
        <p css={title}>PROCESSING DATA</p>
        <p css={description}>
          Please wait while we set things up. <br /> This could take up to a few
          minutes...
        </p>
      </div>
    </div>
  );
}

export default InitialLoadingDataOverlay;
