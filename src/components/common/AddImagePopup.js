/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import usePostImageUpload from '../../hooks/usePostImageUpload';
import { createDefaultImageComponent, selectImage } from '../../utils';
import { button } from './styles';

import { useLayoutEffect } from 'react';
import ApiRequestOverlay from './ApiRequestOverlay';

const container = (theme) =>
  css({
    zIndex: 200,
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

const hideStyle = css({
  zIndex: -1,
  opacity: 0,
});

const content = css({
  width: '80vw',
  minHeight: '80vh',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
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

const uploadContainer = css({
  display: 'flex',
  alignItems: 'center',
  padding: 40,

  p: {
    fontSize: 13,
  },
});

const uploadForm = css({});

const uploadInput = css({
  width: 0.1,
  height: 0.1,
  opacity: 0,
  overflow: 'hidden',
  position: 'absolute',
  zIndex: '-1',
});

const componentButton = css(button, {
  fontSize: 13,
  padding: '7px 10px',
  borderRadius: 3,
});

const uploadLabel = (theme) =>
  css(componentButton, {
    marginLeft: 50,
    backgroundColor: theme.colors.lightblue,
  });

const uploadPreviewContainer = css({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
});

const imageContainer = css({
  position: 'relative',
  width: '16.8vw', // popup is 60vw wide
  maxWidth: 330,
  height: '11.2vw',
  maxHeight: 220,
  backgroundColor: 'black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',

  img: {
    objectFit: 'scale-down',
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

const uploadPreviewName = css({ marginTop: 5 });

const selectedImageBorder = (theme) =>
  css({
    border: `3px solid ${theme.colors.green}`,
  });

const selectedImageIcon = (theme) =>
  css({
    position: 'absolute',
    top: 10,
    right: 10,
    color: theme.colors.green,
  });

const orDivider = (theme) =>
  css({
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    color: theme.colors.midgrey,

    p: { fontSize: 13 },

    div: {
      width: '40%',
      height: 1,
      borderTop: `1px solid ${theme.colors.midgrey}`,
    },
  });

const existingImagesContainer = css({
  transform: 'translateZ(0)', // overrides Chrome bug that makes the text blurry when applying margin
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 40,

  p: { fontSize: 14 },
});

const imagesContainer = css({
  overflowX: 'hidden',
  overflowY: 'scroll',
  maxHeight: '40vh',
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  flexGrow: 1,
});

const imageMargin = css({
  marginTop: 15,
});

const footer = (theme) =>
  css({
    backgroundColor: theme.colors.lightlightgrey,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 40px',
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

const initialUploadPreview = { name: null, url: null };

function AddImagePopup({
  show,
  close,
  setImageComponentsModified,
  setUnsavedChange,
  device,
}) {
  // should probably use usereducer since these change together
  const [uploadPreview, setUploadPreview] = useState(initialUploadPreview);
  const [selectedImage, setSelectedImage] = useState(null);

  const { images } = useData();
  const {
    run: postImageUpload,
    status: postImageUploadStatus,
  } = usePostImageUpload();

  function closeAndReset() {
    close();
    setUploadPreview(initialUploadPreview);
    setSelectedImage(null);
  }

  useLayoutEffect(() => {
    if (postImageUploadStatus === 'resolved') {
      closeAndReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postImageUploadStatus]);

  function handleUploadFile(e) {
    const url = URL.createObjectURL(e.target.files[0]);
    let name = e.target.value.match(/[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/g); // remove path from name

    setUploadPreview({ url, name });
    setSelectedImage('upload');
  }

  function handleUploadFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    formData.append('ref', 'image');
    formData.append('field', 'image');

    postImageUpload(formData, setImageComponentsModified, device);
    setUnsavedChange(true);
  }

  function handleExistingImage() {
    const newImage = images.find((image) => image.id === selectedImage);

    setImageComponentsModified((imageComponents) => {
      const newComponent = createDefaultImageComponent({
        imageComponents,
        image: newImage,
        device,
        page: 'portfolio',
      });

      return [...imageComponents, newComponent];
    });

    setUnsavedChange(true);
    closeAndReset();
  }

  return (
    <div css={[container, !show && hideStyle]}>
      <ApiRequestOverlay status={postImageUploadStatus} />
      <div css={content}>
        <div css={header}>
          <FontAwesomeIcon
            css={button}
            icon={faTimes}
            onClick={() => close()}
          />
        </div>
        <div css={uploadContainer}>
          <p>Upload Image:</p>
          <form
            css={uploadForm}
            id="upload-form"
            onSubmit={handleUploadFormSubmit}
          >
            <label css={uploadLabel} htmlFor="imageUpload">
              Browse files
            </label>
            <input
              css={uploadInput}
              type="file"
              name="files"
              id="imageUpload"
              onChange={handleUploadFile}
            />
          </form>
          {uploadPreview.url && (
            <div css={uploadPreviewContainer}>
              <div
                css={[
                  imageContainer,
                  selectedImage === 'upload' && selectedImageBorder,
                ]}
                onClick={() => setSelectedImage('upload')}
              >
                <img src={uploadPreview.url} alt="" />
                {selectedImage === 'upload' && (
                  <FontAwesomeIcon
                    css={selectedImageIcon}
                    icon={faCheckCircle}
                  />
                )}
              </div>
              <p css={uploadPreviewName}>{uploadPreview.name}</p>
            </div>
          )}
        </div>
        <div css={orDivider}>
          <div />
          <p>or</p>
          <div />
        </div>
        <div css={existingImagesContainer}>
          <p>Select from existing images:</p>
          <div css={imagesContainer}>
            {images.map((image) => (
              <div
                css={[
                  imageContainer,
                  imageMargin,
                  selectedImage === image.id && selectedImageBorder,
                ]}
                onClick={() => setSelectedImage(image.id)}
                key={image.id}
              >
                <img src={selectImage(image.image, 'thumbnail')} alt="" />
                {selectedImage === image.id && (
                  <FontAwesomeIcon
                    css={selectedImageIcon}
                    icon={faCheckCircle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div css={footer}>
          <div css={cancelButton} onClick={() => close()}>
            Cancel
          </div>
          {selectedImage && selectedImage === 'upload' ? (
            <button css={confirmButton} form="upload-form" type="submit">
              Confirm
            </button>
          ) : (
            <button css={confirmButton} onClick={handleExistingImage}>
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddImagePopup;
