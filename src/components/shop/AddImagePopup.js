/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useLayoutEffect, useState, useMemo } from 'react';

import { useData } from '../../context/DataContext';
import usePostImageUpload from '../../hooks/usePostImageUpload';
import { selectImage } from '../../utils';
import ApiRequestOverlay from '../common/ApiRequestOverlay';
import { button } from '../common/styles';

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
  height: '80vh',
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

const body = css({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'hidden',
  padding: '20px 40px',
});

const uploadContainer = css({
  display: 'flex',
  alignItems: 'center',
  paddingBottom: 10,

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

const currentImageText = (theme) =>
  css({
    position: 'absolute',
    bottom: 2,
    left: 2,
    zIndex: 100,
    backgroundColor: theme.colors.midgrey,
    color: 'white',
    padding: '2px 4px',
    fontSize: 12,
    fontVariant: 'small-caps',
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
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  marginTop: 20,

  p: { fontSize: 14 },
});

const imagesContainer = css({
  overflowX: 'hidden',
  overflowY: 'auto',
  maxHeight: '40vh',
  marginTop: 10,
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
});

const imageMargin = css({
  marginBottom: 15,
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

const selectedImageInitialState = { type: null, id: null };

/* NOTES
  - should be a seperate function for change main image rather than addImage
*/

function AddImagePopup({ show, close, product, addImage }) {
  const [selectedImage, setSelectedImage] = useState({
    ...selectedImageInitialState,
  });

  // SET UP DATA

  const { images: allImages } = useData();
  const productImages = useMemo(() => product?.images, [product]);
  const nonProductImages = useMemo(
    () =>
      productImages && allImages
        ? allImages.filter(
            (image) =>
              !productImages.find(
                (productImage) => productImage.id === image.id
              )
          )
        : null,
    [allImages, productImages]
  );

  // HANDLE UPLOAD

  const {
    run: postUpload,
    data: uploadData,
    status: postUploadStatus,
  } = usePostImageUpload();

  useLayoutEffect(() => {
    if (postUploadStatus === 'resolved' && uploadData) {
      console.log(uploadData);
      addImage('upload', uploadData);
      closeAndReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postUploadStatus, uploadData]);

  // HELPER FUNCTIONS

  function handleUploadFile(e) {
    const uploadUrl = URL.createObjectURL(e.target.files[0]);
    const uploadName = e.target.value.match(
      /[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/g
    ); // remove path from name

    setSelectedImage((selectedImage) => {
      return { ...selectedImage, type: 'upload', uploadUrl, uploadName };
    });
  }

  function handleExistingImage() {
    const { type } = selectedImage;
    if (type === 'product') {
      const newMainImageId = selectedImage.id;
      addImage(type, newMainImageId);
    }
    if (type === 'other') {
      const newImageId = selectedImage.id;
      const newImage = nonProductImages.find(
        (image) => image.id === newImageId
      );
      addImage(type, newImage);
    }
    closeAndReset();
  }

  function handleUpload(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    formData.append('ref', 'image');
    formData.append('field', 'image');

    postUpload(formData);
  }

  function closeAndReset() {
    close();
    setSelectedImage(selectedImageInitialState);
  }

  return (
    <div css={[container, !show && hideStyle]}>
      <ApiRequestOverlay status={postUploadStatus} />
      <div css={content}>
        <div css={header}>
          <FontAwesomeIcon
            css={button}
            icon={faTimes}
            onClick={() => close()}
          />
        </div>
        <div css={body}>
          <div css={uploadContainer}>
            <p>Upload new image:</p>
            <form css={uploadForm} id="upload-form" onSubmit={handleUpload}>
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
            {selectedImage.uploadUrl && (
              <div css={uploadPreviewContainer}>
                <div
                  css={[
                    imageContainer,
                    selectedImage.type === 'upload' && selectedImageBorder,
                  ]}
                  onClick={() =>
                    setSelectedImage((selectedImage) => {
                      return { ...selectedImage, type: 'upload' };
                    })
                  }
                >
                  <img src={selectedImage.uploadUrl} alt="" />
                  {selectedImage.type === 'upload' && (
                    <FontAwesomeIcon
                      css={selectedImageIcon}
                      icon={faCheckCircle}
                    />
                  )}
                </div>
                <p css={uploadPreviewName}>{selectImage.uploadName}</p>
              </div>
            )}
          </div>
          <div css={orDivider}>
            <div />
            <p>or</p>
            <div />
          </div>
          {product && product.images[0] && (
            <div css={[existingImagesContainer, { minHeight: '15vw' }]}>
              <p>Select from product's images:</p>
              <div css={imagesContainer}>
                {product &&
                  product.images.map((image) => (
                    <div
                      css={[
                        imageContainer,
                        imageMargin,
                        selectedImage.type === 'product' &&
                          selectedImage.id === image.id &&
                          selectedImageBorder,
                        image.shopHomeStatus === 'main' && {
                          cursor: 'default',
                        },
                      ]}
                      onClick={() => {
                        if (image.shopHomeStatus !== 'main')
                          setSelectedImage((selectedImage) => {
                            return {
                              ...selectedImage,
                              type: 'product',
                              id: image.id,
                            };
                          });
                      }}
                      key={image.id}
                    >
                      <img
                        src={selectImage(image.image.image, 'thumbnail')}
                        alt=""
                      />
                      {selectedImage.type === 'product' &&
                        selectedImage.id === image.id && (
                          <FontAwesomeIcon
                            css={selectedImageIcon}
                            icon={faCheckCircle}
                          />
                        )}
                      {image.shopHomeStatus === 'main' && (
                        <p css={currentImageText}>current image</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div css={existingImagesContainer}>
            <p>Select from other images:</p>
            <div css={imagesContainer}>
              {nonProductImages &&
                nonProductImages.map((image) => (
                  <div
                    css={[
                      imageContainer,
                      imageMargin,
                      selectedImage.type === 'other' &&
                        selectedImage.id === image.id &&
                        selectedImageBorder,
                    ]}
                    onClick={() =>
                      setSelectedImage((selectedImage) => {
                        return {
                          ...selectedImage,
                          type: 'other',
                          id: image.id,
                        };
                      })
                    }
                    key={image.id}
                  >
                    <img src={selectImage(image.image, 'thumbnail')} alt="" />
                    {selectedImage.type === 'other' &&
                      selectedImage.id === image.id && (
                        <FontAwesomeIcon
                          css={selectedImageIcon}
                          icon={faCheckCircle}
                        />
                      )}
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div css={footer}>
          <div css={cancelButton} onClick={() => close()}>
            Cancel
          </div>
          {selectedImage.type && (
            <React.Fragment>
              {selectedImage.type === 'upload' ? (
                <button css={confirmButton} form="upload-form" type="submit">
                  Confirm
                </button>
              ) : (
                <button css={confirmButton} onClick={handleExistingImage}>
                  Confirm
                </button>
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddImagePopup;
