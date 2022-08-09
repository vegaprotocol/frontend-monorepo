import { renderHook } from '@testing-library/react';
import useMarketPositions from './use-market-positions';

let mockNotEmptyData = {
  party: {
    accounts: [
      {
        balance: '50001000000',
        asset: {
          decimals: 5,
        },
        market: {
          id: 'marketId',
        },
      },
      {
        balance: '700000000000000000000000000000',
        asset: {
          decimals: 5,
        },
        market: {
          id: 'someOtherMarketId',
        },
      },
    ],
    positionsConnection: {
      edges: [
        {
          node: {
            openVolume: '100002',
            market: {
              id: 'marketId',
            },
          },
        },
        {
          node: {
            openVolume: '3',
            market: {
              id: 'someOtherMarketId',
            },
          },
        },
      ],
    },
  },
};

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(() => ({ data: mockNotEmptyData })),
}));

describe('useOrderPosition Hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return proper positive value', () => {
    const { result } = renderHook(() =>
      useMarketPositions({ marketId: 'marketId', partyId: 'partyId' })
    );
    expect(result.current?.openVolume.toNumber()).toEqual(100002);
    expect(result.current?.balance.toString()).toEqual('50001000000');
  });

  it('if balance equal 0 return null', () => {
    mockNotEmptyData = {
      party: {
        accounts: [
          {
            balance: '0',
            asset: {
              decimals: 5,
            },
            market: {
              id: 'marketId',
            },
          },
        ],
        positionsConnection: {
          edges: [
            {
              node: {
                openVolume: '2',
                market: {
                  id: 'marketId',
                },
              },
            },
          ],
        },
      },
    };
    const { result } = renderHook(() =>
      useMarketPositions({ marketId: 'marketId', partyId: 'partyId' })
    );
    expect(result.current).toBeNull();
  });

  it('if no markets return null', () => {
    mockNotEmptyData = {
      party: {
        accounts: [
          {
            balance: '33330',
            asset: {
              decimals: 5,
            },
            market: {
              id: 'otherMarketId',
            },
          },
        ],
        positionsConnection: {
          edges: [
            {
              node: {
                openVolume: '2',
                market: {
                  id: 'otherMarketId',
                },
              },
            },
          ],
        },
      },
    };
    const { result } = renderHook(() =>
      useMarketPositions({ marketId: 'marketId', partyId: 'partyId' })
    );
    expect(result.current).toBeNull();
  });
});
