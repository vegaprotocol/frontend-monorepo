import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { FULL_ROUTES } from '../../routes/route-names';

const IGNORED_PATHS = new Set([
  FULL_ROUTES.home,
  FULL_ROUTES.login,
  FULL_ROUTES.onboarding,
  FULL_ROUTES.createPassword,
  FULL_ROUTES.saveMnemonic,
  FULL_ROUTES.createWallet,
  FULL_ROUTES.importWallet,
]);

export let previousLocation: string | null = null;

export const setPreviousLocation = (val: string | null) => {
  previousLocation = val;
};

export const usePersistLocation = () => {
  const location = useLocation();

  useEffect(() => {
    // Ignore the home route as we do not want to persist this
    // users will never be on the home route, it's only a passthrough
    // to get them to the place they need to be. So if on home this is
    // an initial load we do not wish to persist
    if (!IGNORED_PATHS.has(location.pathname)) {
      previousLocation = location.pathname;
    }
  }, [location]);
};
