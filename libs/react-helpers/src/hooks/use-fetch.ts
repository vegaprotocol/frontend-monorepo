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

// discriminated union type
type Action<T> =
  | { type: ActionType.LOADING }
  | { type: ActionType.FETCHED; payload: T }
  | { type: ActionType.ERROR; error: Error };

export const useFetch = <T>(
  url: string,
  options?: RequestInit,
  initialFetch = true
): {
  state: State<T>;
  refetch: (
    params?: Record<string, string | number | null | undefined> | undefined,
    body?: BodyInit
  ) => Promise<T | undefined>;
} => {
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
  const fetchCallback = useCallback(
    async (
      params?: Record<string, string | null | undefined | number>,
      body?: BodyInit
    ) => {
      if (!url) return;

      const fetchData = async () => {
        dispatch({ type: ActionType.LOADING });
        let data;
        try {
          const assembledUrl = new URL(url);
          if (params) {
            for (const [key, value] of Object.entries(params)) {
              if (value) {
                assembledUrl.searchParams.set(key, value.toString());
              }
            }
          }

          const response = await fetch(assembledUrl.toString(), {
            ...options,
            body: body ? body : options?.body,
          });
          if (!response.ok) {
            throw new Error(response.statusText);
          }

          data = (await response.json()) as T;
          // @ts-ignore - 'error' in data
          if (data && 'error' in data) {
            // @ts-ignore - data.error
            throw new Error(data.error);
          }
          if (cancelRequest.current) return;

          dispatch({ type: ActionType.FETCHED, payload: data });
        } catch (error) {
          if (cancelRequest.current) return;

          dispatch({ type: ActionType.ERROR, error: error as Error });
        }
        return data;
      };

      return fetchData();
    },
    // Do nothing if the url is not given
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url]
  );

  useEffect(() => {
    cancelRequest.current = false;
    if (initialFetch) {
      fetchCallback();
    }
  }, [fetchCallback, initialFetch, url]);

  useEffect(() => {
    // Use the cleanup function for avoiding a possibly...
    // ...state update after the component was unmounted
    return () => {
      cancelRequest.current = true;
    };
  }, []);

  return {
    state,
    refetch: fetchCallback,
  };
};
