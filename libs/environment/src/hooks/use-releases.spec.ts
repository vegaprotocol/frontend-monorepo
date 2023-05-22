import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { GITHUB_VEGA_FRONTEND_RELEASES_DATA } from './mocks/github-releases';
import {
  GITHUB_VEGA_FRONTEND_RELEASES,
  ReleasesFeed,
  useReleases,
} from './use-releases';

describe('useReleases', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('should return an empty list when request is unsuccessful', async () => {
    fetchMock.get(GITHUB_VEGA_FRONTEND_RELEASES, 404);

    const { result } = renderHook(() => {
      return useReleases(ReleasesFeed.FrontEnd);
    });
    expect(result.current.loading).toBeTruthy();
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toEqual([]);
    });
  });

  it('should return a list of releases', async () => {
    fetchMock.get(
      GITHUB_VEGA_FRONTEND_RELEASES,
      GITHUB_VEGA_FRONTEND_RELEASES_DATA
    );

    const { result } = renderHook(() => useReleases(ReleasesFeed.FrontEnd));
    expect(result.current.loading).toBeTruthy();
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current).not.toEqual([]);
      const data = result.current.data;
      expect(data?.[0].tagName).toEqual('v0.20.8-core-0.71.4');
      expect(data?.[0].htmlUrl).toEqual(
        'https://github.com/vegaprotocol/frontend-monorepo/releases/tag/v0.20.8-core-0.71.4'
      );
      expect(data?.[1].tagName).toEqual('v0.20.6-core-0.71.4-3');
      expect(data?.[2].tagName).toEqual('v0.20.6-core-0.71.4');
    });
  });
});
