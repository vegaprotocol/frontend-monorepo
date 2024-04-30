import { renderHook } from '@testing-library/react';
import { useTotalValueLockedQuery } from './__generated__/TotalVolumeLocked';
import { useTotalValueLocked } from './use-total-volume-locked';

jest.mock('./__generated__/TotalVolumeLocked.ts');
const mockUseTotalValueLocked = useTotalValueLockedQuery as jest.Mock;

describe('useTotalValueLocked', () => {
  mockUseTotalValueLocked.mockReturnValue({
    data: {
      partiesConnection: {
        edges: [
          {
            node: {
              accountsConnection: {
                edges: [
                  {
                    node: {
                      balance: '10',
                      asset: {
                        symbol: 'XYZ',
                        quantum: '1',
                      },
                    },
                  },
                  {
                    node: {
                      balance: '10',
                      asset: {
                        symbol: 'XYZ',
                        quantum: '1',
                      },
                    },
                  },
                  {
                    node: {
                      balance: '10',
                      asset: {
                        symbol: 'XYZ',
                        quantum: '1',
                      },
                    },
                  },
                  {
                    node: {
                      balance: '10',
                      asset: {
                        symbol: 'VEGA',
                        quantum: '1',
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
    loading: false,
    error: null,
  });

  it('calculates TVL correctly', () => {
    const { result } = renderHook(() => useTotalValueLocked());
    expect(result.current.tvl.toNumber()).toEqual(30);
  });
});
