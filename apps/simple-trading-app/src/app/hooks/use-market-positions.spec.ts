import { renderHook } from '@testing-library/react-hooks';
import useMarketPositions from './use-market-positions';

let mockNotEmptyData = {
  party: {
    positionsConnection: {
      edges: [
        {
          node: {
            market: {
              id: 'marketId',
              accounts: [
                {
                  balance: '1000000',
                },
              ],
            },
            openVolume: '2',
          },
        },
        {
          node: {
            market: {
              id: 'marketId',
              accounts: [
                {
                  balance: '50000000000',
                },
              ],
            },
            openVolume: '100000',
          },
        },
        {
          node: {
            market: {
              id: 'someOtherMarketId',
              accounts: [
                {
                  balance: '700000000000000000000000000000',
                },
              ],
            },
            openVolume: '3',
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
    expect(result.current?.balanceSum.toString()).toEqual('50001000000');
  });

  it('if balance equal 0, volume should be 0', () => {
    mockNotEmptyData = {
      party: {
        positionsConnection: {
          edges: [
            {
              node: {
                market: {
                  id: 'marketId',
                  accounts: [
                    {
                      balance: '0',
                    },
                  ],
                },
                openVolume: '2',
              },
            },
          ],
        },
      },
    };
    const { result } = renderHook(() =>
      useMarketPositions({ marketId: 'marketId', partyId: 'partyId' })
    );
    expect(result.current?.openVolume.toNumber()).toEqual(0);
    expect(result.current?.balanceSum.toString()).toEqual('0');
  });

  it('if no markets return null', () => {
    mockNotEmptyData = {
      party: {
        positionsConnection: {
          edges: [
            {
              node: {
                market: {
                  id: 'otherMarketId',
                  accounts: [
                    {
                      balance: '33330',
                    },
                  ],
                },
                openVolume: '2',
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
