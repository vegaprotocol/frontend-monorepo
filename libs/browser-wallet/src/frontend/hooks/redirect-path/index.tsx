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
    } else if (!globals.passphrase) {
      // If the user has no passphrase set redirect to the get started page
      setResult({
        loading: false,
        path: FULL_ROUTES.getStarted,
      });
      // If the user has a passphrase but the wallet is locked then redirect to the login page
    } else if (globals.locked) {
      setResult({
        loading: false,
        path: FULL_ROUTES.login,
      });
      // If the user has a passphrase and the app is unlocked but and has no wallets created but does have a saved mnemonic redirect to the save mnemonic page
    } else if (globals.wallet) {
      // If the user has a path they were previously on then redirect to that
      const path = localStorage.getItem(LOCATION_KEY);
      setResult({
        loading: false,
        path: path ?? FULL_ROUTES.wallets,
      });
    }
    // else if (globals.settings.telemetry === null || globals.settings.telemetry === undefined) {
    //   setResult({
    //     loading: false,
    //     path: FULL_ROUTES.telemetry
    //   })
    // }
    else {
      setResult({
        loading: false,
        path: FULL_ROUTES.createWallet,
      });
    }
  }, [globals, loading]);

  useEffect(() => {
    getRedirectPath();
  }, [getRedirectPath]);

  return result;
};
