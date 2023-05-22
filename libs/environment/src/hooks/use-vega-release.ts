import { useMemo } from 'react';
import { useVegaReleases } from './use-vega-releases';

export const useVegaRelease = (tag: string, includeDevReleases = false) => {
  const { data } = useVegaReleases(includeDevReleases, 'force-cache');
  return useMemo(() => {
    return data?.find((r) => r.tagName === tag);
  }, [data, tag]);
};
