const filterNew = (components) =>
  components.filter((component) => component.new);
const filterUpdated = (components) =>
  components.filter((component) => component.updated && !component.new);

const filterResponses = (responses, method) =>
  responses.filter((response) => response.config.method === method);

const filterArr1WithArr2 = (arr1, arr2, filterType, arr1IdField = 'id') => {
  const arr2Ids = arr2.map((element) => element.id);
  return arr1.filter((element) =>
    filterType === 'includes'
      ? arr2Ids.includes(element[arr1IdField])
      : !arr2Ids.includes(element[arr1IdField])
  );
};

const findElement = (elementId, elementArray, fieldToFindBy = 'id') =>
  elementArray.find(
    (arrayElement) => arrayElement[fieldToFindBy] === elementId
  );

const sortByAscending = (components, field) =>
  components.sort((a, b) => a[field] - b[field]);

function calcPercentageValue(percent, value) {
  return (percent / 100) * value;
}

function convertValueToPercent(part, whole) {
  return (part / whole) * 100;
}

const filterDuplicateComponents = (components) =>
  components.filter(
    (component, i, self) => i === self.findIndex((c) => c.id === component.id)
  );

function scrollToBottom() {
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }, 200);
}

function scrollToTop() {
  window.scrollTo({
    top: -500,
    left: 0,
    behavior: 'smooth',
  });
}

function convertToLocalTimeString(time) {
  const d = new Date(time);
  return d.toLocaleTimeString();
}

function conventToLocalDateString(time) {
  const d = new Date(time);
  return d.toLocaleDateString();
}

function createPlaceholderArray(length) {
  const array = [];
  for (let i = 0; i < length; i++) {
    array.push(i);
  }

  return array;
}

export {
  filterNew,
  filterUpdated,
  filterResponses,
  filterArr1WithArr2,
  findElement,
  sortByAscending,
  filterDuplicateComponents,
  calcPercentageValue,
  convertValueToPercent,
  scrollToBottom,
  scrollToTop,
  convertToLocalTimeString,
  createPlaceholderArray,
  conventToLocalDateString,
};
