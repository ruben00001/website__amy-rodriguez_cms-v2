import produce from 'immer';
import { useReducer } from 'react';
import { useFetch } from '../context/FetchContext';
import { createDefaultImageComponent } from '../utils';

function asyncReducer(_, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', data: null, error: null };
    }
    case 'resolved': {
      return { status: 'resolved', data: action.data, error: null };
    }
    case 'rejected': {
      return { status: 'rejected', data: null, error: action.error };
    }
    case 'idle': {
      return { status: 'idle', data: null, error: null };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const idleState = { status: 'idle', data: null, error: null };

function usePostImageUpload() {
  const [state, dispatch] = useReducer(asyncReducer, {
    ...idleState,
  });

  const { authFetch, authFormFetch } = useFetch();

  function reset() {
    dispatch({ type: 'idle' });
  }

  async function run(formData, setImageComponentsModified, device) {
    console.log('running post image upload...');
    dispatch({ type: 'pending' });
    try {
      const postImageResponse = await authFetch.post('/images');
      const newImageId = postImageResponse.data.id;

      formData.append('refId', newImageId);

      const uploadResponse = await authFormFetch.post('/upload', formData);

      setImageComponentsModified((components) => {
        const newImage = produce(postImageResponse.data, (draft) => {
          draft.image = uploadResponse.data[0];
        });
        const newImageComponent = createDefaultImageComponent(
          components,
          newImage,
          device
        );

        return [...components, newImageComponent];
      });

      dispatch({ type: 'resolved' });
      setTimeout(() => {
        reset();
      }, 500);
    } catch (error) {
      dispatch({ type: 'rejected', error });
      setTimeout(() => {
        reset();
      }, 1500);
    }
  }

  return { ...state, run };
}

export default usePostImageUpload;
