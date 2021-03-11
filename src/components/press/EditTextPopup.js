/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { button } from '../common/styles';

const container = (theme) =>
  css({
    zIndex: 500,
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: theme.colors.loadingOverlay,
    transition: 'opacity ease-in-out 0.2s',
  });

const body = css({
  width: '80vw',
  minHeight: '80vh',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  maxWidth: 1200,
  borderRadius: 2,
});

const header = (theme) =>
  css({
    backgroundColor: theme.colors.lightlightgrey,
    color: theme.colors.midgrey,
    textAlign: 'right',
    padding: '3px 6px',
    fontSize: 22,
  });

const content = css({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const formStyle = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const inputContainer = css({
  position: 'relative',
  marginBottom: 40,
});

const inputStyle = css({
  border: '1px solid black',
  borderRadius: 2,
  marginLeft: 20,
  padding: '8px 15px',

  ':focus': {
    border: '1px solid black',
  },
});

const visitLinkText = css({
  position: 'absolute',
  right: 0,
  bottom: -25,
  fontSize: 12,

  a: {
    color: 'black',
  },
});

const footer = (theme) =>
  css({
    backgroundColor: theme.colors.lightlightgrey,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 40px',
  });

const componentButton = css(button, {
  fontSize: 13,
  padding: '7px 10px',
  borderRadius: 3,
});

const cancelButton = (theme) =>
  css(componentButton, {
    border: `1px solid ${theme.colors.midgrey}`,
    color: theme.colors.midgrey,
  });

const confirmButton = (theme) =>
  css(componentButton, {
    backgroundColor: theme.colors.green,
    color: 'white',
    fontWeight: 800,
  });

function EditTextPopup({ show, close, element, updateElement }) {
  const [title, setTitle] = useState(element?.title);
  const [link, setLink] = useState(element?.linkUrl);

  function handleSubmit(e) {
    e.preventDefault();
    updateElement('title', title);
    updateElement('linkUrl', link);
    close();
  }

  return (
    <div css={[container, !show && { display: 'none' }]}>
      <div css={body}>
        <div css={header}>
          <FontAwesomeIcon
            css={button}
            icon={faTimes}
            onClick={() => close()}
          />
        </div>
        <div css={content}>
          <form css={formStyle} id="text-form" onSubmit={handleSubmit}>
            <div css={inputContainer}>
              <label htmlFor="title">Title:</label>
              <input
                css={inputStyle}
                id="title"
                type="text"
                defaultValue={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div css={inputContainer}>
              <label htmlFor="linkUrl">Link:</label>
              <input
                css={inputStyle}
                id="linkUrl"
                type="url"
                defaultValue={link}
                onChange={(e) => setLink(e.target.value)}
              />
              {link && (
                <p css={visitLinkText}>
                  Visit site{' '}
                  <span>
                    <a href={link} target="_blank" rel="noreferrer">
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                  </span>
                </p>
              )}
            </div>
          </form>
        </div>
        <div css={footer}>
          <div css={cancelButton} onClick={() => close()}>
            Cancel
          </div>

          <button css={confirmButton} form="text-form" type="submit">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTextPopup;
