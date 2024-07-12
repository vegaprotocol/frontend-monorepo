import type BigNumber from 'bignumber.js';
import { useFormContext } from 'react-hook-form';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { removeDecimal } from '@vegaprotocol/utils';

import { Slider } from './slider';
import { useTicketContext } from './ticket-context';

import * as defaultUtils from './ticket-default/utils';
import * as utils from './utils';

export const SizeSlider = ({ price }: { price: BigNumber | undefined }) => {
  const form = useFormContext();
  const ticket = useTicketContext();
  const { pubKey } = useVegaWallet();
  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  const side = form.watch('side');
  const type = form.watch('type');
  const sizeMode = form.watch('sizeMode');

  if (!price) return null;
  if (!ticket.market.riskFactors) return null;
  if (!ticket.market.tradableInstrument.marginCalculator?.scalingFactors) {
    return null;
  }

  const marginMode = ticket.marginMode;
  const scalingFactors =
    ticket.market.tradableInstrument.marginCalculator.scalingFactors;
  const riskFactors = ticket.market.riskFactors;

  return (
    <Slider
      min={0}
      max={100}
      defaultValue={[0]}
      disabled={!price || price.isZero() || price.isNaN()}
      onValueCommit={(value) => {
        const size = defaultUtils.calcSizeByPct({
          pct: value[0],
          openVolume,
          price: removeDecimal(price, ticket.market.decimalPlaces),
          type,
          side,
          assetDecimals: ticket.quoteAsset.decimals,
          marketDecimals: ticket.market.decimalPlaces,
          positionDecimals: ticket.market.positionDecimalPlaces,
          accounts: ticket.accounts,
          orders: orders || [],
          scalingFactors,
          riskFactors,
          marginMode,
        });

        if (sizeMode === 'contracts') {
          form.setValue('size', size.toString(), { shouldValidate: true });
        } else if (sizeMode === 'notional') {
          const notional = utils.toNotional(size, price);
          form.setValue('size', notional.toString(), { shouldValidate: true });
        }
      }}
    />
  );
};
