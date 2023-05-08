import type { AgGridReact } from 'ag-grid-react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { useFillsList } from './use-fills-list';
import type { TradeEdge } from './fills-data-provider';

let mockData = null;
let mockDataProviderData = {
  data: mockData as (TradeEdge | null)[] | null,
  error: undefined,
  loading: true,
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

describe('useFillsList Hook', () => {
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
      () => useFillsList({ partyId, gridRef, scrolledToTop }),
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
        },
      } as unknown as TradeEdge,
      {
        node: {
          id: 'data_id_2',
        },
      } as unknown as TradeEdge,
    ];
    mockDataProviderData = {
      ...mockDataProviderData,
      data: mockData,
      loading: false,
    };
    const { result } = renderHook(
      () => useFillsList({ partyId, gridRef, scrolledToTop }),
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
    updateMock({ data: mockData });
    expect(mockRefreshAgGridApi).not.toHaveBeenCalled();
    updateMock({ data: mockData });
    expect(mockRefreshAgGridApi).toHaveBeenCalled();
  });
});
