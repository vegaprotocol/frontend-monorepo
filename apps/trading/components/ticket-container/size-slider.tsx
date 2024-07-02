import * as SliderPrimitives from '@radix-ui/react-slider';
import { useT } from '../../lib/use-t';
import { useFormContext } from 'react-hook-form';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type MarketInfo, useMarkPrice } from '@vegaprotocol/markets';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { calcSizeMarketOrder } from './helpers';

export const SizeSlider = ({
  market,
  balances,
  asset,
}: {
  market: MarketInfo;
  balances: { margin: string; general: string };
  asset: AssetFieldsFragment;
}) => {
  const t = useT();
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
    <SliderPrimitives.Root
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
          balances,
          orders: orders || [],
          scalingFactors,
          riskFactors,
        });

        form.setValue('size', size.toString(), { shouldValidate: true });
      }}
      className="relative flex items-center select-none touch-none w-full height-10"
    >
      <SliderPrimitives.Track className="relative h-1 bg-black flex-1 rounded" />
      <SliderPrimitives.Thumb
        className="block w-4 h-4 bg-vega-blue rounded-full"
        aria-label={t('Size')}
      />
    </SliderPrimitives.Root>
  );
};
