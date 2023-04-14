/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

export const GITHUB_VEGA_RELEASES =
  'https://api.github.com/repos/vegaprotocol/vega/releases';
export const GITHUB_VEGA_DEV_RELEASES =
  'https://api.github.com/repos/vegaprotocol/vega-dev-releases/releases';

const GithubReleaseSchema = z.object({
  url: z.string(),
  html_url: z.string(),
  id: z.number(),
  tag_name: z.string(),
  name: z.string().nullable(),
  draft: z.boolean(),
  created_at: z.string().datetime(),
});

const GithubReleasesSchema = z.array(GithubReleaseSchema);

type ReleaseInfo = {
  id: number;
  name: string;
  tagName: string;
  htmlUrl: string;
  url: string;
  isDraft: boolean;
  createdAt: Date;
  isDevRelease: boolean;
};

const toReleaseInfo = (
  releaseData: z.infer<typeof GithubReleaseSchema>,
  isDevRelease: boolean
): ReleaseInfo => ({
  id: releaseData.id,
  name: releaseData.name || '',
  tagName: releaseData.tag_name,
  htmlUrl: releaseData.html_url,
  url: releaseData.url,
  isDraft: releaseData.draft,
  createdAt: new Date(releaseData.created_at),
  isDevRelease,
});

enum ReleaseFeed {
  // @ts-ignore TS18033 - allowed in 5.0
  Vega = GITHUB_VEGA_RELEASES,
  // @ts-ignore TS18033
  VegaDev = GITHUB_VEGA_DEV_RELEASES,
}

const fetchReleases = async (feed: ReleaseFeed) => {
  const response = await fetch(String(feed), {
    cache: 'force-cache',
  });

  if (response.ok) {
    const json = await response.json();
    const data = GithubReleasesSchema.parse(json);
    return data.map((d) => toReleaseInfo(d, feed === ReleaseFeed.VegaDev));
  }

  return [];
};

type State = {
  loading: boolean;
  data: ReleaseInfo[] | null;
  error: Error | null | undefined;
};

/**
 * Retrieves a list of vega releases from github.
 * First element is the newest.
 */
export const useVegaReleases = (includeDevReleases = false) => {
  const [state, setState] = useState<State>({
    loading: true,
    data: null,
    error: null,
  });

  const fetchData = useCallback(() => {
    let mounted = true;

    Promise.all(
      includeDevReleases
        ? [fetchReleases(ReleaseFeed.Vega), fetchReleases(ReleaseFeed.VegaDev)]
        : [fetchReleases(ReleaseFeed.Vega)]
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
  }, [includeDevReleases, setState]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
};
