import { useCallback, useEffect, useReducer, useRef } from 'react';

interface State<T> {
  data?: T;
  error?: Error;
  loading?: boolean;
}

enum ActionType {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  FETCHED = 'FETCHED',
}

type Action<T> =
  | { type: ActionType.LOADING }
  | { type: ActionType.FETCHED; payload: T }
  | { type: ActionType.ERROR; error: Error };

export const useEthereumReadContract = <T>(
  contractFunc: () => Promise<T> | undefined
) => {
  const cancelRequest = useRef(false);

  const initialState: State<T> = {
    error: undefined,
    data: undefined,
    loading: false,
  };

  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case ActionType.LOADING:
        return { ...state, loading: true };
      case ActionType.FETCHED:
        return { ...state, data: action.payload, loading: false };
      case ActionType.ERROR:
        return { ...state, error: action.error, loading: false };
    }
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  const fetchCallback = useCallback(async () => {
    dispatch({ type: ActionType.LOADING });
    try {
      const result = contractFunc();
      if (!result) {
        return;
      }
      const response = await result;
      if (cancelRequest.current) return;
      dispatch({ type: ActionType.FETCHED, payload: response });
    } catch (error) {
      if (cancelRequest.current) return;
      dispatch({ type: ActionType.ERROR, error: error as Error });
    }
  }, [contractFunc]);

  useEffect(() => {
    cancelRequest.current = false;
    fetchCallback();

    return () => {
      cancelRequest.current = true;
    };
  }, [fetchCallback]);

  return { state, refetch: fetchCallback };
};
