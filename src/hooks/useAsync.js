import { useReducer, useCallback, useMemo } from 'react';

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', error: null };
    }
    case 'resolved': {
      return { status: 'resolved', res: action.res, error: null };
    }
    case 'complete': {
      return { ...state, status: 'complete' };
    }
    case 'rejected': {
      return { status: 'rejected', res: null, error: action.error };
    }
    case 'idle': {
      return { status: 'idle', res: null, error: null };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const idleState = { status: 'idle', data: null, error: null };

function useAsync() {
  const [state, dispatch] = useReducer(asyncReducer, {
    ...idleState,
  });

  const run = useCallback((promise, processData, processError) => {
    dispatch({ type: 'pending' });
    promise
      .then((res) => {
        dispatch({
          type: 'resolved',
          res,
        });
        if (processData) processData(res);
        setTimeout(() => {
          dispatch({
            type: 'complete', // gives animations <0.7sec to transition out and not re-trigger when status remains 'resolved'
          });
        }, 700);
      })
      .catch((error) => {
        if (processError) processError();
        dispatch({ type: 'rejected', error });
        setTimeout(() => {
          dispatch({
            type: 'complete',
          });
        }, 1800);
      });
  }, []);

  const isActive = useMemo(
    () =>
      state.status === 'pending' ||
      state.status === 'resolved' ||
      state.status === 'rejected',
    [state.status]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'idle' });
  }, []);

  return { ...state, run, isActive, reset };
}

export default useAsync;
