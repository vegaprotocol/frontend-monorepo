import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import {
  GITHUB_VEGA_DEV_RELEASES,
  GITHUB_VEGA_RELEASES,
  useVegaReleases,
} from './use-vega-releases';
import {
  GITHUB_VEGA_RELEASES_DATA,
  GITHUB_VEGA_DEV_RELEASES_DATA,
} from './mocks/github-releases';

describe('useVegaReleases', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('should return an empty list when 404 given', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, 404);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, 404);

    const { result } = renderHook(() => useVegaReleases());
    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should return a full list of releases', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, GITHUB_VEGA_RELEASES_DATA);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_DEV_RELEASES_DATA);

    const { result } = renderHook(() => useVegaReleases());
    await waitFor(() => {
      expect(result.current).not.toEqual([]);
      const all = result.current.reverse();
      expect(all[0].tag_name).toEqual('v0.70.3');
      expect(all[0].html_url).toEqual(
        'https://github.com/vegaprotocol/vega/releases/tag/v0.70.3'
      );
      expect(all[1].tag_name).toEqual('v0.70.2');
      expect(all[2].tag_name).toEqual('v0.70.1');
      expect(fetchMock.calls().length).toEqual(2);
    });
  });

  it('should fetch only once', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, GITHUB_VEGA_RELEASES_DATA);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_DEV_RELEASES_DATA);

    const { result, rerender } = renderHook(() => useVegaReleases());
    rerender(1);
    rerender(2);
    rerender(3);
    await waitFor(() => {
      expect(result.current).not.toEqual([]);
      rerender(4);
      expect(fetchMock.calls().length).toEqual(2);
    });
  });
});
