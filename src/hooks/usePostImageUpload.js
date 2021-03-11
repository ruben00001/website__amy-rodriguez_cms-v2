import { useMemo, useReducer } from 'react';
import { useFetch } from '../context/FetchContext';

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', data: null, error: null };
    }
    case 'resolved': {
      return { status: 'resolved', data: action.data, error: null };
    }
    case 'complete': {
      return { ...state, status: 'complete' };
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

  async function run(formData) {
    dispatch({ type: 'pending' });
    try {
      const postImageResponse = await authFetch.post('/images');
      const newImageId = postImageResponse.data.id;

      formData.append('refId', newImageId);

      const uploadResponse = await authFormFetch.post('/upload', formData);

      const newImageWithUpload = {
        ...postImageResponse.data,
        image: { ...uploadResponse.data[0] },
      };

      dispatch({ type: 'resolved', data: newImageWithUpload });

      setTimeout(() => {
        dispatch({
          type: 'complete',
        });
      }, 700);
    } catch (error) {
      dispatch({ type: 'rejected', error });
      setTimeout(() => {
        dispatch({
          type: 'complete',
        });
      }, 1800);
    }
  }

  const isActive = useMemo(
    () =>
      state.status === 'pending' ||
      state.status === 'resolved' ||
      state.status === 'rejected',
    [state.status]
  );

  return { ...state, run, isActive };
}

export default usePostImageUpload;
