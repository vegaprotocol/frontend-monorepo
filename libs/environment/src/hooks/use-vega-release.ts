import { useMemo } from 'react';
import { useVegaReleases } from './use-vega-releases';

export const useVegaRelease = (tag: string) => {
  const releases = useVegaReleases();
  return useMemo(() => {
    return releases.filter((r) => r.tag_name === tag);
  }, [releases, tag]);
};
