import { useCallback, useEffect, useReducer, useRef } from "react";

interface State<T> {
  data?: T;
  error?: Error;
  loading?: boolean;
}

enum ActionType {
  LOADING = "LOADING",
  ERROR = "ERROR",
  FETCHED = "FETCHED",
}

// discriminated union type
type Action<T> =
  | { type: ActionType.LOADING }
  | { type: ActionType.FETCHED; payload: T }
  | { type: ActionType.ERROR; error: Error };

function useFetch<T = unknown>(
  url?: string,
  options?: RequestInit
): { state: State<T>; refetch: () => void } {
  // Used to prevent state update if the component is unmounted
  const cancelRequest = useRef<boolean>(false);

  const initialState: State<T> = {
    error: undefined,
    data: undefined,
    loading: false,
  };

  // Keep state logic separated
  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case ActionType.LOADING:
        return { ...initialState, loading: true };
      case ActionType.FETCHED:
        return { ...initialState, data: action.payload, loading: false };
      case ActionType.ERROR:
        return { ...initialState, error: action.error, loading: false };
    }
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const fetchCallback = useCallback(() => {
    if (!url) return;

    const fetchData = async () => {
      dispatch({ type: ActionType.LOADING });

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = (await response.json()) as T;
        if ("error" in data) {
          // @ts-ignore - data.error
          throw new Error(data.error);
        }
        if (cancelRequest.current) return;

        dispatch({ type: ActionType.FETCHED, payload: data });
      } catch (error) {
        if (cancelRequest.current) return;

        dispatch({ type: ActionType.ERROR, error: error as Error });
      }
    };

    void fetchData();

    // Do nothing if the url is not given
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    fetchCallback();
    // Use the cleanup function for avoiding a possibly...
    // ...state update after the component was unmounted
    return () => {
      cancelRequest.current = true;
    };
  }, [fetchCallback]);

  return {
    state,
    refetch: fetchCallback,
  };
}

export default useFetch;
