import produce from 'immer';
import { sortByAscending } from '.';

const interpretMultipleFetchStatuses = (statuses) => {
  if (statuses.includes('rejected')) return 'rejected';
  if (statuses.includes('pending')) return 'pending';
  if (statuses.includes('resolved')) return 'resolved';
  return statuses[0];
};

const confirmWrapper = (type, payload) => {
  let message;
  switch (type) {
    case 'delete':
      message = 'Are you sure want to delete?';
      break;
    case 'undo':
      message =
        'Any unsaved work will be lost. Are you sure you want to undo changes?';
      break;
    default:
      throw new Error(`Unhandled type: ${type}`);
  }
  const confirmRes = window.confirm(message);
  if (confirmRes) {
    payload();
  }
};

function selectComponent(components, device, mediaQueryType) {
  const componentsAscending = produce(components, (draft) =>
    sortByAscending(draft, mediaQueryType)
  );

  for (let i = 0; i < componentsAscending.length; i++) {
    const element = componentsAscending[i];
    const nextElement = componentsAscending[i + 1];

    if (device[mediaQueryType] <= element[mediaQueryType] || !nextElement) {
      return element;
    }
  }
}

function createImageComponent({ id, orderAndLayerValue, image, device, page }) {
  const deviceAspectRatio = device ? device.aspectRatio : 1.8;
  const landscapePosition = { aspectRatio: 1.8, x: 0, y: -10 };
  const portraitPosition = {
    aspectRatio: 0.75,
    x: -2,
    y: 0,
  };

  const newComponent = {
    id: id,
    layer: orderAndLayerValue,
    order: orderAndLayerValue,
    positions: [landscapePosition, portraitPosition],
    widths: [{ aspectRatio: deviceAspectRatio, value: 5 }],
    image: image,
    new: true,
  };

  if (page === 'shop') {
    newComponent.shopHomeStatus = 'main';
  }

  return newComponent;
}

const addElement = (element, setData) => setData((data) => [...data, element]);

const deleteElement = (element, array, fieldToFindBy = 'id') => {
  const arrayIndex = array.findIndex(
    (arrayElement) => arrayElement[fieldToFindBy] === element[fieldToFindBy]
  );
  array.splice(arrayIndex, 1);
};

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

export {
  addElement,
  confirmWrapper,
  createImageComponent,
  deleteElement,
  interpretMultipleFetchStatuses,
  selectComponent,
  selectImage,
};
