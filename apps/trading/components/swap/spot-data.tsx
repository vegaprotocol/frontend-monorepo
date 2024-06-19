import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { Side } from '@vegaprotocol/types';
import { useT } from '../../lib/use-t';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { getExternalChainShortLabel } from '@vegaprotocol/environment';
import BigNumber from 'bignumber.js';

export const SpotData = ({
  side,
  tolerance,
  topAmount,
  bottomAmount,
  topAsset,
  bottomAsset,
}: {
  side?: Side;
  tolerance?: string;
  topAmount: string;
  bottomAmount: string;
  topAsset?: AssetFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
}) => {
  const t = useT();
  if (!topAsset || !bottomAsset) return null;
  if (!topAmount || !bottomAmount) return null;

  const topAssetSymbol =
    topAsset.source.__typename === 'ERC20'
      ? `${topAsset.symbol} (${getExternalChainShortLabel(
          topAsset.source.chainId
        )})`
      : topAsset.symbol;

  const bottomAssetSymbol =
    bottomAsset.source.__typename === 'ERC20'
      ? `${bottomAsset.symbol} (${getExternalChainShortLabel(
          bottomAsset.source.chainId
        )})`
      : bottomAsset.symbol;

  if (!side) return null;

  if (!tolerance || tolerance === '0') {
    return (
      <Notification
        intent={Intent.Info}
        message={t(
          'You will pay {{topAmount}} {{topAssetSymbol}} to receive {{bottomAmount}} {{bottomAssetSymbol}} (based on {{bestPrice}} price).',
          {
            tolerance: tolerance || 0,
            topAmount,
            topAssetSymbol,
            bottomAmount,
            bottomAssetSymbol,
            bestPrice: side === Side.SIDE_BUY ? 'best ask' : 'best bid',
          }
        )}
      />
    );
  }

  const toleranceFactor = tolerance ? Number(tolerance) / 100 : 0;

  if (side === Side.SIDE_SELL) {
    const bottomAmountWithTolerance = new BigNumber(bottomAmount)
      .times(1 - toleranceFactor) // best bid
      .toString();
    return (
      <Notification
        intent={Intent.Info}
        message={t(
          'You will pay {{topAmount}} {{topAssetSymbol}} to receive between {{bottomAmount}} {{bottomAssetSymbol}} (best bid) and {{bottomAmountWithTolerance}} {{bottomAssetSymbol}} based on your price tolerance of {{tolerance}}%.',
          {
            tolerance,
            topAmount,
            topAssetSymbol,
            bottomAmount,
            bottomAssetSymbol,
            bottomAmountWithTolerance,
          }
        )}
      />
    );
  }

  if (side === Side.SIDE_BUY) {
    const topAmountWithTolerance = new BigNumber(topAmount)
      .times(1 + toleranceFactor) // best ask
      .toString();
    return (
      <Notification
        intent={Intent.Info}
        message={t(
          'You will pay between {{topAmount}} {{topAssetSymbol}} (best ask) and {{topAmountWithTolerance}} {{topAssetSymbol}} to receive {{bottomAmount}} {{bottomAssetSymbol}} based on your price tolerance of {{tolerance}}%.',
          {
            tolerance,
            topAmount,
            topAssetSymbol,
            bottomAmount,
            bottomAssetSymbol,
            topAmountWithTolerance,
          }
        )}
      />
    );
  }
  return null;
};
