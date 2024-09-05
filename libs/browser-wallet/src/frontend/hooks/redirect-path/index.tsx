import { useCallback, useEffect, useState } from 'react';

import { useGlobalsStore } from '@/stores/globals';

import { FULL_ROUTES } from '../../routes/route-names';
import { LOCATION_KEY } from '../persist-location';

interface State {
  loading: boolean;
  path: string | null;
}

export const useGetRedirectPath = () => {
  const [result, setResult] = useState<State>({
    loading: true,
    path: null,
  });
  const { loading, globals } = useGlobalsStore((state) => ({
    loading: state.loading,
    globals: state.globals,
  }));

  const getRedirectPath = useCallback(async () => {
    // If loading then we do not know where to redirect to yet
    if (loading || !globals) {
      setResult({
        loading: true,
        path: null,
      });
    } else if (globals.wallet) {
      // If the user has a path they were previously on then redirect to that
      const path = localStorage.getItem(LOCATION_KEY);
      setResult({
        loading: false,
        path: path ?? FULL_ROUTES.wallets,
      });
    } else {
      // As we only allow for importing a wallet at this time, this is enough
      setResult({
        loading: false,
        path: FULL_ROUTES.importWallet,
      });
    }
  }, [globals, loading]);

  useEffect(() => {
    getRedirectPath();
  }, [getRedirectPath]);

  return result;
};
