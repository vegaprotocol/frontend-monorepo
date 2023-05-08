import type { AgGridReact } from 'ag-grid-react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { usePositionsData } from './use-positions-data';
import type { Position } from './positions-data-providers';

let mockData: Position[] = [
  {
    marketName: 'M1',
    marketId: 'market-0',
    openVolume: '1',
  },
  {
    marketName: 'M2',
    marketId: 'market-1',
    openVolume: '-1985',
  },
  {
    marketName: 'M3',
    marketId: 'market-2',
    openVolume: '0',
  },
  {
    marketName: 'M4',
    marketId: 'market-3',
    openVolume: '0',
  },
  {
    marketName: 'M5',
    marketId: 'market-4',
    openVolume: '3',
  },
] as Position[];

let mockDataProviderData = {
  data: mockData,
  error: undefined,
  loading: false,
  totalCount: undefined,
};

let updateMock: jest.Mock;
const mockDataProvider = jest.fn((args) => {
  updateMock = args.update;
  return mockDataProviderData;
});
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((args) => mockDataProvider(args)),
}));

describe('usePositionData Hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const mockRefreshInfiniteCache = jest.fn();
  const mockGetRowNode = jest
    .fn()
    .mockImplementation((id: string) =>
      mockData.find((position) => position.marketId === id)
    );
  const partyId = 'partyId';
  const anUpdatedOne = {
    marketId: 'market-1',
    openVolume: '1',
  };
  const gridRef = {
    current: {
      api: {
        refreshInfiniteCache: mockRefreshInfiniteCache,
        getRowNode: mockGetRowNode,
        getModel: () => ({ getType: () => 'infinite' }),
      },
    } as unknown as AgGridReact,
  };

  it('should return proper data', async () => {
    const { result } = renderHook(() => usePositionsData(partyId, gridRef), {
      wrapper: MockedProvider,
    });
    expect(result.current.data?.length ?? 0).toEqual(5);
  });

  it('should call mockRefreshInfiniteCache', async () => {
    renderHook(() => usePositionsData(partyId, gridRef), {
      wrapper: MockedProvider,
    });
    await waitFor(() => {
      updateMock({ delta: [anUpdatedOne] as Position[] });
    });

    expect(mockRefreshInfiniteCache).toHaveBeenCalledWith();
  });

  it('no data should return null', () => {
    mockData = [];
    mockDataProviderData = {
      ...mockDataProviderData,
      data: mockData,
      loading: false,
    };
    const { result } = renderHook(() => usePositionsData(partyId, gridRef), {
      wrapper: MockedProvider,
    });
    expect(result.current.data).toEqual([]);
  });
});
