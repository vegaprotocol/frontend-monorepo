import type { AgGridReact } from 'ag-grid-react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { useFillsList } from './use-fills-list';
import type { Fills_party_tradesConnection_edges } from './__generated__/Fills';

let mockData = null;
let mockDataProviderData = {
  data: mockData as (Fills_party_tradesConnection_edges | null)[] | null,
  error: undefined,
  loading: true,
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

describe('useFillsList Hook', () => {
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
      } as unknown as Fills_party_tradesConnection_edges,
      {
        node: {
          id: 'data_id_2',
        },
      } as unknown as Fills_party_tradesConnection_edges,
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
    expect(mockRefreshAgGridApi).not.toHaveBeenCalled();
    updateMock({ data: {} });
    expect(mockRefreshAgGridApi).toHaveBeenCalled();
  });
});
