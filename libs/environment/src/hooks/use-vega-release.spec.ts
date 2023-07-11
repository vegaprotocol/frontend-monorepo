import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_RELEASES } from './use-releases';
import {
  GITHUB_VEGA_RELEASES_DATA,
  GITHUB_VEGA_DEV_RELEASES_DATA,
} from './mocks/github-releases';
import { useVegaRelease } from './use-vega-release';
import { act } from 'react-dom/test-utils';

describe('useVegaRelease', () => {
  beforeEach(() => {
    fetchMock.get(GITHUB_VEGA_RELEASES, GITHUB_VEGA_RELEASES_DATA);
    fetchMock.get(GITHUB_VEGA_DEV_RELEASES, GITHUB_VEGA_DEV_RELEASES_DATA);
  });
  afterEach(() => {
    fetchMock.reset();
  });

  it('should return release information by given tag', async () => {
    const { result } = renderHook(() => useVegaRelease('v0.70.1'));
    await waitFor(() => {
      expect(result.current).toBeTruthy();
      expect(result.current?.tagName).toEqual('v0.70.1');
      expect(result.current?.htmlUrl).toEqual(
        'https://github.com/vegaprotocol/vega/releases/tag/v0.70.1'
      );
      expect(result.current?.name).toEqual('v0.70.1');
      expect(result.current?.isDraft).toBeFalsy();
    });
  });

  it('should return undefined when a release cannot be found', async () => {
    const { result } = renderHook(() => useVegaRelease('v0.70.1'));
    await act(
      async () =>
        await waitFor(() => {
          expect(result.current).toEqual(undefined);
        })
    );
  });
});
