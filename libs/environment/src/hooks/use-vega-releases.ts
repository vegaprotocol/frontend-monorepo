import sortBy from 'lodash/sortBy';
import { useMemo } from 'react';
import z from 'zod';
import { useFetch } from '@vegaprotocol/react-helpers';

export const GITHUB_VEGA_RELEASES =
  'https://api.github.com/repos/vegaprotocol/vega/releases';
export const GITHUB_VEGA_DEV_RELEASES =
  'https://api.github.com/repos/vegaprotocol/vega-dev-releases/releases';

const githubReleaseSchema = z.object({
  url: z.string(),
  html_url: z.string(),
  id: z.number(),
  tag_name: z.string(),
  name: z.string().nullable(),
  draft: z.boolean(),
  created_at: z.string().datetime(),
});

const githubReleasesSchema = z.array(githubReleaseSchema);

export const useVegaReleases = (withDevReleases = false) => {
  const {
    state: { data: releasesData },
  } = useFetch<typeof githubReleasesSchema>(GITHUB_VEGA_RELEASES, {
    cache: 'force-cache',
  });

  const {
    state: { data: devReleasesData },
  } = useFetch<typeof githubReleasesSchema>(GITHUB_VEGA_DEV_RELEASES, {
    cache: 'force-cache',
  });

  const all = useMemo(() => {
    const releases = releasesData
      ? githubReleasesSchema
          .parse(releasesData)
          .map((r) => ({ ...r, dev: false }))
      : [];
    const devReleases = devReleasesData
      ? githubReleasesSchema
          .parse(devReleasesData)
          .map((r) => ({ ...r, dev: true }))
      : [];
    return sortBy(releases.concat(devReleases), 'created_at');
  }, [devReleasesData, releasesData]);
  return all;
};
