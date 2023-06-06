import { localLoggerFactory } from '@vegaprotocol/logger';
import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

export const GITHUB_VEGA_RELEASES =
  'https://api.github.com/repos/vegaprotocol/vega/releases';
export const GITHUB_VEGA_DEV_RELEASES =
  'https://api.github.com/repos/vegaprotocol/vega-dev-releases/releases';
export const GITHUB_VEGA_FRONTEND_RELEASES =
  'https://api.github.com/repos/vegaprotocol/frontend-monorepo/releases';

export enum ReleasesFeed {
  Vega = GITHUB_VEGA_RELEASES,
  VegaDev = GITHUB_VEGA_DEV_RELEASES,
  FrontEnd = GITHUB_VEGA_FRONTEND_RELEASES,
}

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

export type ReleaseInfo = {
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

export type ReleasesState = {
  loading: boolean;
  data: ReleaseInfo[] | null;
  error: Error | null | undefined;
};
export const fetchReleases = async (
  feed: ReleasesFeed,
  cache: RequestCache = 'default'
) => {
  const response = await fetch(String(feed), {
    cache,
  });

  if (response.ok) {
    const json = await response.json();
    const data = GithubReleasesSchema.parse(json);
    return data.map((d) => toReleaseInfo(d, feed === ReleasesFeed.VegaDev));
  }

  return [];
};

export const useReleases = (feed: ReleasesFeed, cache?: RequestCache) => {
  const [state, setState] = useState<ReleasesState>({
    loading: true,
    data: null,
    error: null,
  });
  const logger = localLoggerFactory({ application: 'github' });

  const fetchData = useCallback(() => {
    let mounted = true;

    fetchReleases(feed, cache)
      .then((releases) => {
        if (mounted) {
          setState({
            loading: false,
            data: releases.sort(
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
        logger.error('get releases from GitHub API', err);
      });

    return () => {
      mounted = false;
    };
  }, [cache, feed, logger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
};
