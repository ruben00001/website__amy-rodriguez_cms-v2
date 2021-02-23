import { useReducer, useCallback } from 'react';

function asyncReducer(_, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', error: null };
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

function useAsyncThenProcessData() {
  const [state, dispatch] = useReducer(asyncReducer, {
    ...idleState,
    // ...initialState,
  });

  const run = useCallback((promise, processData) => {
    dispatch({ type: 'pending' });
    promise
      .then((data) => {
        const processedData = processData(data);
        dispatch({ type: 'resolved', processedData });
      })
      .catch((error) => {
        dispatch({ type: 'rejected', error });
      });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'idle' });
  }, []);

  return { ...state, run, reset };
}

export default useAsyncThenProcessData;
