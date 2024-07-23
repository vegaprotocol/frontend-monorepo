import { renderHook } from '@testing-library/react';
import { useTotalValueLocked } from './use-total-volume-locked';
import { createAssetFields } from '@vegaprotocol/mock';
import { useEnabledAssets } from '@vegaprotocol/assets';
import { useReadContracts } from 'wagmi';

jest.mock('wagmi', () => ({
  useReadContracts: jest.fn(),
}));

jest.mock('@vegaprotocol/assets', () => ({
  useEnabledAssets: jest.fn(),
}));

describe('useTotalValueLocked', () => {
  it('calculates TVL correctly', () => {
    (useEnabledAssets as jest.Mock).mockReturnValue({
      data: [
        createAssetFields({ quantum: '1000000', decimals: 6 }),
        createAssetFields({ quantum: '1000000', decimals: 6 }),
        createAssetFields({ quantum: '1000000', decimals: 6 }),
      ],
    });
    (useReadContracts as jest.Mock).mockReturnValue({
      data: [
        { result: BigInt(1000000) },
        { result: BigInt(1000000) },
        { result: BigInt(1000000) },
      ],
    });
    const { result } = renderHook(() => useTotalValueLocked());
    expect(result.current.data.toNumber()).toEqual(3);
  });

  it('handles different quantums', () => {
    (useEnabledAssets as jest.Mock).mockReturnValue({
      data: [
        createAssetFields({ quantum: '100', decimals: 2 }),
        createAssetFields({ quantum: '10000', decimals: 4 }),
        createAssetFields({ quantum: '1000000', decimals: 6 }),
      ],
    });
    (useReadContracts as jest.Mock).mockReturnValue({
      data: [
        { result: BigInt(100) },
        { result: BigInt(10000) },
        { result: BigInt(1000000) },
      ],
    });
    const { result } = renderHook(() => useTotalValueLocked());
    expect(result.current.data.toNumber()).toEqual(3);
  });
});
