import * as React from 'react';
import { useLocation } from 'react-router-dom';

export function useSearchParams() {
  const location = useLocation();

  return React.useMemo(() => {
    return new URLSearchParams(location.search) as any;
  }, [location]);
}
