import type { AgGridReact } from 'ag-grid-react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrderListData } from './use-order-list-data';
import type { Edge } from '@vegaprotocol/react-helpers';
import type { OrderFieldsFragment } from '../order-data-provider/__generated__/Orders';
import type { IGetRowsParams } from 'ag-grid-community';

const loadMock = jest.fn();

let mockData: Edge<OrderFieldsFragment>[] | null = null;
let mockDataProviderData = {
  data: mockData as (Edge<OrderFieldsFragment> | null)[] | null,
  error: undefined,
  loading: true,
  load: loadMock,
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

describe('useOrderListData Hook', () => {
  const mockRefreshAgGridApi = jest.fn();
  const partyId = 'partyId';
  const gridRef = {
    current: {
      api: {
        refreshInfiniteCache: mockRefreshAgGridApi,
        getModel: () => ({ getType: () => 'infinite' }),
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
      } as unknown as Edge<OrderFieldsFragment>,
      {
        node: {
          id: 'data_id_2',
          createdAt: 2,
        },
      } as unknown as Edge<OrderFieldsFragment>,
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
    updateMock({ data: mockData, delta: [] });
    expect(mockRefreshAgGridApi).toHaveBeenCalled();
  });

  it('methods for pagination should work', async () => {
    const successCallback = jest.fn();
    mockData = [
      {
        node: {
          id: 'data_id_1',
          createdAt: 1,
        },
      } as unknown as Edge<OrderFieldsFragment>,
      {
        node: {
          id: 'data_id_2',
          createdAt: 2,
        },
      } as unknown as Edge<OrderFieldsFragment>,
    ];
    Object.assign(mockDataProviderData, {
      data: mockData,
      loading: false,
    });
    const mockDelta = [
      {
        node: {
          id: 'data_id_3',
          createdAt: 3,
        },
      } as unknown as Edge<OrderFieldsFragment>,
      {
        node: {
          id: 'data_id_4',
          createdAt: 4,
        },
      } as unknown as Edge<OrderFieldsFragment>,
    ];
    const mockNextData = [...mockData, ...mockDelta];
    const { result } = renderHook(
      () => useOrderListData({ partyId, gridRef, scrolledToTop }),
      {
        wrapper: MockedProvider,
      }
    );

    const getRowsParams = {
      successCallback,
      failCallback: jest.fn(),
      startRow: 2,
      endRow: 4,
    } as unknown as IGetRowsParams;

    await waitFor(async () => {
      updateMock({ data: mockData });
    });

    await waitFor(async () => {
      const promise = result.current.getRows(getRowsParams);
      updateMock({ data: mockNextData, delta: mockDelta });
      await promise;
    });
    expect(loadMock).toHaveBeenCalled();
    expect(successCallback).toHaveBeenLastCalledWith(
      mockDelta.map((item) => item.node),
      undefined
    );
  });
});
