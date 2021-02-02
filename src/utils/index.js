import produce from 'immer';

const selectImage = (image, quality) => {
  if (!quality) {
    throw new Error('selectImage must contain a second argument: quality');
  }
  const formats = ['thumbnail', 'small', 'medium', 'large'];
  if (!formats.includes(quality)) {
    throw new Error(
      'that image quality type is not an option. You may have a typo.'
    );
  }
  if (!image.formats) {
    return image.url;
  }
  if (image[quality]) {
    return image[quality].url;
  } else {
    const availableFormats = [image.formats.thumbnail.url];
    if (image.formats.small) {
      availableFormats.push(image.formats.small.url);
    }
    if (image.formats.medium) {
      availableFormats.push(image.formats.medium.url);
    }
    if (image.formats.large) {
      availableFormats.push(image.formats.large.url);
    }
    return availableFormats[availableFormats.length - 1];
  }
};

function sortByAscendingOrder(a, b) {
  return a.order - b.order;
}

function selectStyleDataForDevice(styleData, device) {
  if (!device) {
    throw new Error(
      'please include style components as first arg and device as second arg'
    );
  }
  const styleDataAscending = produce(styleData, (draft) =>
    draft.sort((a, b) => a.aspectRatio - b.aspectRatio)
  );

  const deviceAspectRatio = device.aspectRatio;

  for (let i = 0; i < styleDataAscending.length; i++) {
    const element = styleDataAscending[i];
    const nextElement = styleDataAscending[i + 1];

    if (deviceAspectRatio <= element.aspectRatio || !nextElement) {
      return element;
    }
  }
}

function calcPercentageValue(percent, value) {
  return (percent / 100) * value;
}

function convertValueToPercent(part, whole) {
  return (part / whole) * 100;
}

function createTemporaryUniqueId(components) {
  const existingIds = components.map((component) => component.id);
  const numberComponents = components.length;
  const possibleNewIds = Array.from(
    Array(numberComponents + 1),
    (_, i) => i + 1
  ).filter((id) => !existingIds.includes(id));

  return possibleNewIds[0];
}

function createDefaultImageComponent({ imageComponents, image, device, page }) {
  const id = createTemporaryUniqueId(imageComponents);
  const numberComponents = imageComponents.length;
  const deviceAspectRatio = device ? device.aspectRatio : 1.8;
  const landscapePosition = { aspectRatio: deviceAspectRatio, x: 0, y: -20 };
  const portraitPosition = {
    aspectRatio: deviceAspectRatio,
    x: 102,
    y: 0,
  };

  const newComponent = {
    id: id,
    layer: numberComponents + 1,
    order: numberComponents + 1,
    positions: [
      device?.aspectRatio < 1 || page === 'shop'
        ? portraitPosition
        : landscapePosition,
    ],
    widths: [{ aspectRatio: deviceAspectRatio, value: 20 }],
    image: image,
    new: true, // needed to know if id should be removed (so Strapi can create its own)
  };

  if (page === 'shop') {
    newComponent.shopHomeStatus = 'main';
  }

  return newComponent;
}

function scrollToBottom() {
  window.scrollTo({
    top: document.body.scrollHeight,
    left: 0,
    behavior: 'smooth',
  });
}

function convertToLocalTimeString(time) {
  const d = new Date(time);
  return d.toLocaleTimeString();
}

function confirmWrapper(message, payload) {
  const confirmRes = window.confirm(message);
  if (confirmRes) {
    payload();
  }
}

function createPlaceholderArray(length) {
  const array = [];
  for (let i = 0; i < length; i++) {
    array.push(i);
  }

  return array;
}

export {
  selectImage,
  selectStyleDataForDevice,
  calcPercentageValue,
  convertValueToPercent,
  createTemporaryUniqueId,
  createDefaultImageComponent,
  scrollToBottom,
  convertToLocalTimeString,
  sortByAscendingOrder,
  confirmWrapper,
  createPlaceholderArray,
};
