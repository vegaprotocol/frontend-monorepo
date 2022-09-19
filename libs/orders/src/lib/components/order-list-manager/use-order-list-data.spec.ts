import type { AgGridReact } from 'ag-grid-react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrderListData } from './use-order-list-data';
import type {
  Orders_party_ordersConnection_edges,
  Orders_party_ordersConnection_edges_node,
} from '../order-data-provider/__generated__/Orders';
import type { IGetRowsParams } from 'ag-grid-community';

const loadMock = jest.fn();

let mockData = null;
let mockDataProviderData = {
  data: mockData as (Orders_party_ordersConnection_edges | null)[] | null,
  error: undefined,
  loading: true,
  load: loadMock,
  totalCount: 0,
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

describe('useOrderListData Hook', () => {
  const mockRefreshAgGridApi = jest.fn();
  const partyId = 'partyId';
  const gridRef = {
    current: {
      api: {
        refreshInfiniteCache: mockRefreshAgGridApi,
      },
    } as unknown as AgGridReact,
  };
  const scrolledToTop = {
    current: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return proper dataProvider results', () => {
    const { result } = renderHook(
      () => useOrderListData({ partyId, gridRef, scrolledToTop }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current).toMatchObject({
      data: null,
      error: undefined,
      loading: true,
      addNewRows: expect.any(Function),
      getRows: expect.any(Function),
    });
  });

  it('return proper mocked results', () => {
    mockData = [
      {
        node: {
          id: 'data_id_1',
          createdAt: 1,
        },
      } as unknown as Orders_party_ordersConnection_edges,
      {
        node: {
          id: 'data_id_2',
          createdAt: 2,
        },
      } as unknown as Orders_party_ordersConnection_edges,
    ];
    mockDataProviderData = {
      ...mockDataProviderData,
      data: mockData,
      loading: false,
    };
    const { result } = renderHook(
      () => useOrderListData({ partyId, gridRef, scrolledToTop }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current).toMatchObject({
      data: mockData,
      error: undefined,
      loading: false,
      addNewRows: expect.any(Function),
      getRows: expect.any(Function),
    });
    expect(mockRefreshAgGridApi).not.toHaveBeenCalled();
    updateMock({ data: [], delta: [] });
    expect(mockRefreshAgGridApi).toHaveBeenCalled();
  });

  it('methods for pagination should works', async () => {
    const successCallback = jest.fn();
    mockData = [
      {
        node: {
          id: 'data_id_1',
          createdAt: 1,
        },
      } as unknown as Orders_party_ordersConnection_edges,
      {
        node: {
          id: 'data_id_2',
          createdAt: 2,
        },
      } as unknown as Orders_party_ordersConnection_edges,
    ];
    mockDataProviderData = {
      ...mockDataProviderData,
      data: mockData,
      loading: false,
      totalCount: 4,
    };
    const mockDelta = [
      {
        node: {
          id: 'data_id_3',
          createdAt: 3,
        },
      } as unknown as Orders_party_ordersConnection_edges,
      {
        node: {
          id: 'data_id_4',
          createdAt: 4,
        },
      } as unknown as Orders_party_ordersConnection_edges,
    ];
    const mockNextData = [...mockData, ...mockDelta];
    const { result } = renderHook(
      () => useOrderListData({ partyId, gridRef, scrolledToTop }),
      {
        wrapper: MockedProvider,
      }
    );

    updateMock({ data: mockNextData, delta: mockDelta });

    const getRowsParams = {
      successCallback,
      failCallback: jest.fn(),
      startRow: 2,
      endRow: 4,
    } as unknown as IGetRowsParams;

    await waitFor(async () => {
      await result.current.getRows(getRowsParams);
    });
    expect(loadMock).toHaveBeenCalled();
    expect(successCallback).toHaveBeenLastCalledWith(
      mockDelta.map((item) => item.node),
      4
    );
  });
});
