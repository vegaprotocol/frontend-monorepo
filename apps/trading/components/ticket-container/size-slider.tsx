import { useFormContext } from 'react-hook-form';
import { useMarkPrice } from '@vegaprotocol/markets';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { Slider } from './slider';
import { useTicketContext } from './ticket-context';

import * as helpers from './helpers';
import { toBigNum } from '@vegaprotocol/utils';

export const SizeSlider = () => {
  const form = useFormContext();
  const ticket = useTicketContext();
  const { pubKey } = useVegaWallet();
  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  const side = form.watch('side');
  const sizeMode = form.watch('sizeMode');

  if (!markPrice) return null;
  if (!ticket.market.riskFactors) return null;
  if (!ticket.market.tradableInstrument.marginCalculator?.scalingFactors) {
    return null;
  }

  const scalingFactors =
    ticket.market.tradableInstrument.marginCalculator.scalingFactors;
  const riskFactors = ticket.market.riskFactors;

  return (
    <Slider
      min={0}
      max={100}
      defaultValue={[0]}
      onValueCommit={(value) => {
        const size = helpers.calcSizeByPct({
          pct: value[0],
          openVolume,
          markPrice,
          side,
          assetDecimals: ticket.quoteAsset.decimals,
          marketDecimals: ticket.market.decimalPlaces,
          positionDecimals: ticket.market.positionDecimalPlaces,
          accounts: ticket.accounts,
          orders: orders || [],
          scalingFactors,
          riskFactors,
        });

        if (sizeMode === 'contracts') {
          form.setValue('size', size.toString(), { shouldValidate: true });
        } else if (sizeMode === 'notional') {
          const notional = helpers.toNotional(
            size,
            toBigNum(markPrice, ticket.market.decimalPlaces)
          );
          form.setValue('size', notional.toString(), { shouldValidate: true });
        }
      }}
    />
  );
};
