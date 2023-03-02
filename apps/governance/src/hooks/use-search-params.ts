import * as React from 'react';
import { useLocation } from 'react-router-dom';

export function useSearchParams() {
  const location = useLocation();

  return React.useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    // @ts-ignore searchParams doesnt have symbol.iterator
    return Object.fromEntries(searchParams);
  }, [location]);
}
