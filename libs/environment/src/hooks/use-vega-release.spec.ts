import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import {
  GITHUB_VEGA_DEV_RELEASES,
  GITHUB_VEGA_RELEASES,
} from './use-vega-releases';
import {
  GITHUB_VEGA_RELEASES_DATA,
  GITHUB_VEGA_DEV_RELEASES_DATA,
} from './mocks/github-releases';
import { useVegaRelease } from './use-vega-release';

describe('useVegaRelease', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('returns release info by tag', async () => {
    fetchMock.get(GITHUB_VEGA_RELEASES, GITHUB_VEGA_RELEASES_DATA);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_DEV_RELEASES_DATA);

    const { result } = renderHook(() => useVegaRelease('v0.70.1'));
    await waitFor(() => {
      expect(result.current.length).toEqual(1);
      expect(result.current[0].tag_name).toEqual('v0.70.1');
      expect(result.current[0].html_url).toEqual(
        'https://github.com/vegaprotocol/vega/releases/tag/v0.70.1'
      );
      expect(result.current[0].name).toEqual('v0.70.1');
      expect(result.current[0].draft).toBeFalsy();
    });
  });
});
