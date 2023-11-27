import { useCallback, useEffect, useState } from 'react';
import { type ReleasesState } from './use-releases';
import { ReleasesFeed } from './use-releases';
import { fetchReleases } from './use-releases';

/**
 * Retrieves a list of vega releases from github.
 * First element is the newest.
 */
export const useVegaReleases = (
  includeDevReleases = false,
  cache?: RequestCache
) => {
  const [state, setState] = useState<ReleasesState>({
    loading: true,
    data: null,
    error: null,
  });

  const fetchData = useCallback(() => {
    let mounted = true;

    Promise.all(
      includeDevReleases
        ? [
            fetchReleases(ReleasesFeed.Vega, cache),
            fetchReleases(ReleasesFeed.VegaDev, cache),
          ]
        : [fetchReleases(ReleasesFeed.Vega, cache)]
    )
      .then(([vega, vegaDev]) => {
        if (mounted) {
          setState({
            loading: false,
            data: (vegaDev ? vega.concat(vegaDev) : vega).sort(
              (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()
            ),
            error: null,
          });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({
            loading: false,
            data: null,
            error: err,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [cache, includeDevReleases]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
};
