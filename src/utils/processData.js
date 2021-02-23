import produce from 'immer';

const filterReordered = (components) =>
  produce(components, (draft) =>
    draft.filter((component, i) => !component.new && component.order !== i + 1)
  );

const filterResponses = (responses, method) =>
  responses.filter((response) => response.config.method === method);

const filterArr1WithArr2 = (arr1, arr2, filterType, arr1IdField = 'id') => {
  // 4th arg might not be used (check after save in shop)
  const arr2Ids = arr2.map((element) => element.id);
  return arr1.filter((element) =>
    filterType === 'includes'
      ? arr2Ids.includes(element[arr1IdField])
      : !arr2Ids.includes(element[arr1IdField])
  );
};

const applyCorrectValueAndFlag = (component, field, index, componentToFlag) => {
  // componentToFlag gets used for Portfolio + Product image components
  if (component[field] !== index + 1) {
    component[field] = index + 1;

    componentToFlag
      ? (componentToFlag.updated = true)
      : (component.updated = true);
  }
};

// const applyCorrectOrderAndFlag = (component, index, componentToFlag) => {
//   // componentToFlag gets used for Portfolio + Product image components
//   if (component.order !== index + 1) {
//     component.order = index + 1;

//     componentToFlag
//       ? (componentToFlag.updated = true)
//       : (component.updated = true);
//   }
// };

const sortByAscending = (components, field) =>
  components.sort((a, b) => a[field] - b[field]);

const rmTempFields = (imageComponents) =>
  produce(imageComponents, (draft) =>
    draft.forEach((component) => {
      if (component.new) {
        delete component.new;
        delete component.id;
      }
      if (component.updated) {
        delete component.updated;
      }
    })
  );

export {
  rmTempFields,
  filterReordered,
  filterResponses,
  filterArr1WithArr2,
  // rmInvalidImgComponentsAndFlag,
  // sortByAscendingOrder,
  sortByAscending,
  applyCorrectValueAndFlag,
};
