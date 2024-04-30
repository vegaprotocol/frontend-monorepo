import { renderHook } from '@testing-library/react';
import { useTotalVolumeLockedQuery } from './__generated__/TotalVolumeLocked';
import { useTotalVolumeLocked } from './use-total-volume-locked';

jest.mock('./__generated__/TotalVolumeLocked.ts');
const mockUseTotalVolumeLocked = useTotalVolumeLockedQuery as jest.Mock;

describe('useTotalVolumeLocked', () => {
  mockUseTotalVolumeLocked.mockReturnValue({
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
    const { result } = renderHook(() => useTotalVolumeLocked());
    expect(result.current.tvl.toNumber()).toEqual(30);
  });
});
