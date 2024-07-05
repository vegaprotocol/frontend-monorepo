import { useFormContext } from 'react-hook-form';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type MarketInfo, useMarkPrice } from '@vegaprotocol/markets';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { calcSizeMarketOrder } from './helpers';
import { Slider } from './slider';

export const SizeSlider = ({
  market,
  accounts,
  asset,
}: {
  market: MarketInfo;
  accounts: { margin: string; general: string };
  asset: AssetFieldsFragment;
}) => {
  const form = useFormContext();
  const { pubKey } = useVegaWallet();
  const { data: markPrice } = useMarkPrice(market.id);
  const { data: orders } = useActiveOrders(pubKey, market.id);
  const { openVolume } = useOpenVolume(pubKey, market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  const side = form.watch('side');

  if (!markPrice) return null;
  if (!market.riskFactors) return null;
  if (!market.tradableInstrument.marginCalculator?.scalingFactors) return null;

  const scalingFactors =
    market.tradableInstrument.marginCalculator.scalingFactors;
  const riskFactors = market.riskFactors;

  return (
    <Slider
      min={0}
      max={100}
      defaultValue={[0]}
      onValueCommit={(value) => {
        const size = calcSizeMarketOrder({
          pct: value[0],
          openVolume,
          markPrice,
          side,
          assetDecimals: asset.decimals,
          marketDecimals: market.decimalPlaces,
          positionDecimals: market.positionDecimalPlaces,
          accounts,
          orders: orders || [],
          scalingFactors,
          riskFactors,
        });

        form.setValue('size', size, { shouldValidate: true });
      }}
    />
  );
};
