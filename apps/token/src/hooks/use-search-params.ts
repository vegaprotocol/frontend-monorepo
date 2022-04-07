import * as React from "react";
import { useLocation } from "react-router-dom";

export function useSearchParams() {
  const location = useLocation();

  const queryStringParams = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Array.from(params).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as any);
  }, [location]);

  return queryStringParams;
}
