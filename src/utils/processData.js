import produce from 'immer';
import { sortByAscending, filterResponses } from '.';

// const filterReordered = (components) =>
//   produce(components, (draft) =>
//     draft.filter((component, i) => !component.new && component.order !== i + 1)
//   );

const applyCorrectValueAndFlag = (component, field, index, componentToFlag) => {
  // componentToFlag gets used for Portfolio + Product image components
  if (component[field] !== index + 1) {
    component[field] = index + 1;

    componentToFlag
      ? (componentToFlag.updated = true)
      : (component.updated = true);
  }
};

const rmTempFields = (components) =>
  produce(components, (draft) =>
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

function processSaveResData(responses, setRootData) {
  const postResponses = filterResponses(responses, 'post');
  const putResponses = filterResponses(responses, 'put');
  const deleteResponses = filterResponses(responses, 'delete');

  setRootData(
    produce((draft) => {
      postResponses.forEach((res) => draft.push(res.data));
      putResponses.forEach((res) => {
        const data = res.data;
        const draftIndex = draft.findIndex((element) => element.id === data.id);
        draft.splice(draftIndex, 1, data);
      });
      deleteResponses.forEach((res) => {
        const data = res.data;
        const draftIndex = draft.findIndex((element) => element.id === data.id);
        draft.splice(draftIndex, 1);
      });
      sortByAscending(draft, 'order');
    })
  );
}

export {
  rmTempFields,
  // filterReordered,
  applyCorrectValueAndFlag,
  processSaveResData,
};
