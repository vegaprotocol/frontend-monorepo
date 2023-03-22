import fetchMock from 'fetch-mock';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnnouncement } from "./use-announcement";

const MOCK_URL = 'http://somewhere.com/config.json';
const MOCK_ANNOUNCEMENT = {
  text: 'Attention everyone!',
  url: 'http://click.me/',
  urlText: 'Read more',
}

describe.skip('Use announcement hook', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('loads the data', async () => {
    fetchMock.get(MOCK_URL, {
      console: [MOCK_ANNOUNCEMENT],
      governance: [],
      explorer: [],
      wallet: [],
    })
    const { result } = renderHook(() => useAnnouncement('console', MOCK_URL))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual(MOCK_ANNOUNCEMENT)
      expect(result.current.error).toBe(null)
    });
  });

  it('returns an error when cannot load data', async () => {
    fetchMock.get(MOCK_URL, 404)
    const { result } = renderHook(() => useAnnouncement('console', MOCK_URL))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe(null)
      expect(result.current.error).not.toBe(null)
    })
    
  });

  it('returns an error when data is malformed', async () => {
    fetchMock.get(MOCK_URL, {
      some: 'json',
    })
    const { result } = renderHook(() => useAnnouncement('console', MOCK_URL))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe(null)
      expect(result.current.error).not.toBe(null)
    });
  });

  it('filters out expired announcements', async () => {
    fetchMock.get(MOCK_URL, {
      console: [{
        ...MOCK_ANNOUNCEMENT,
        timing: {
          to: new Date(0).toISOString(),
        },
      }],
      governance: [],
      explorer: [],
      wallet: [],
    })
    const { result } = renderHook(() => useAnnouncement('console', MOCK_URL))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)
    });
  });
});