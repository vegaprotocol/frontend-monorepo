import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import get from 'lodash/get';

import { useAssetsStore } from '@/stores/assets-store';

export const useFormatAssetAmount = (assetId?: string, amount?: string) => {
  const { getAssetById, loading } = useAssetsStore((state) => ({
    getAssetById: state.getAssetById,
    loading: state.loading,
  }));
  if (loading || !assetId || !amount)
    return { formattedAmount: undefined, symbol: undefined };
  const assetInfo = getAssetById(assetId);
  const decimals = Number(get(assetInfo, 'details.decimals'));
  const symbol = get(assetInfo, 'details.symbol');
  const noDecimals = !decimals && decimals !== 0;
  if (!symbol || noDecimals)
    throw new Error(
      `Could not find amount, decimals or symbol when trying to render transaction for asset ${assetId}`
    );
  const formattedAmount = formatNumber(toBigNum(amount, decimals), decimals);
  return { formattedAmount, symbol };
};
