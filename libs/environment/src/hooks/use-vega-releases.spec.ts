import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { useVegaReleases } from './use-vega-releases';
import {
  GITHUB_VEGA_RELEASES_DATA,
  GITHUB_VEGA_DEV_RELEASES_DATA,
} from './mocks/github-releases';
import { GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_RELEASES } from './use-releases';

describe('useVegaReleases', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('should return an empty list when request is unsuccessful', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, 404);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, 404);

    const { result } = renderHook(() => useVegaReleases());
    expect(result.current.loading).toBeTruthy();
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toEqual([]);
    });
  });

  it('should return a list of releases', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, GITHUB_VEGA_RELEASES_DATA);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_DEV_RELEASES_DATA);

    const { result } = renderHook(() => useVegaReleases());
    expect(result.current.loading).toBeTruthy();
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current).not.toEqual([]);
      const data = result.current.data;
      expect(data?.[0].tagName).toEqual('v0.70.3');
      expect(data?.[0].htmlUrl).toEqual(
        'https://github.com/vegaprotocol/vega/releases/tag/v0.70.3'
      );
      expect(data?.[1].tagName).toEqual('v0.70.2');
      expect(data?.[2].tagName).toEqual('v0.70.1');
    });
  });

  it('should return a list of releases including dev releases', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, GITHUB_VEGA_RELEASES_DATA);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_DEV_RELEASES_DATA);
    const { result } = renderHook(() => useVegaReleases(true));
    await waitFor(() => {
      expect(result.current.data?.length).toBeGreaterThan(30);
      expect(fetchMock.calls().length).toEqual(2);
    });
  });
});
