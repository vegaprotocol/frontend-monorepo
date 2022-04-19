import * as React from 'react';
import { useLocation } from 'react-router-dom';

export function useSearchParams() {
  const location = useLocation();

  return React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Object.entries(params).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as { [key: string]: string });
  }, [location]);
}
