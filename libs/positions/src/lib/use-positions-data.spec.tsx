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
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn((args) => mockDataProvider(args)),
}));

describe('usePositionData Hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const mockApplyTransactions = jest.fn();
  const mockApplyTransactionsAsync = jest.fn();
  const mockGetRowNode = jest
    .fn()
    .mockImplementation((id: string) =>
      mockData.find((position) => position.marketId === id)
    );
  const partyId = 'partyId';
  const aNewOne = {
    marketId: 'market-5',
    openVolume: '1',
  };
  const toRemoveOne = {
    marketId: 'market-0',
    openVolume: '0',
  };
  const anUpdatedOne = {
    marketId: 'market-1',
    openVolume: '1',
  };
  const gridRef = {
    current: {
      api: {
        applyTransaction: mockApplyTransactions,
        applyTransactionAsync: mockApplyTransactionsAsync,
        getRowNode: mockGetRowNode,
      },
    } as unknown as AgGridReact,
  };

  it('should return proper data', async () => {
    const { result } = renderHook(() => usePositionsData(partyId, gridRef), {
      wrapper: MockedProvider,
    });
    expect(result.current.data?.length ?? 0).toEqual(3);
  });

  it('should append by sync', async () => {
    renderHook(() => usePositionsData(partyId, gridRef), {
      wrapper: MockedProvider,
    });

    await waitFor(() => {
      updateMock({ delta: [aNewOne, toRemoveOne, anUpdatedOne] as Position[] });
    });

    expect(mockApplyTransactions).toHaveBeenCalledWith({
      update: [anUpdatedOne],
      add: [aNewOne],
      remove: [toRemoveOne],
      addIndex: 0,
    });
  });

  it('should append by async', async () => {
    renderHook(() => usePositionsData(partyId, gridRef), {
      wrapper: MockedProvider,
    });
    await waitFor(() => {
      updateMock({ delta: [anUpdatedOne] as Position[] });
    });

    expect(mockApplyTransactionsAsync).toHaveBeenCalledWith({
      update: [anUpdatedOne],
      add: [],
      remove: [],
      addIndex: 0,
    });
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
