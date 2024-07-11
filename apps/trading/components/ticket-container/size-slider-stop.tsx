import type BigNumber from 'bignumber.js';
import { useFormContext } from 'react-hook-form';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { removeDecimal } from '@vegaprotocol/utils';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';

import { Slider } from './slider';
import { useTicketContext } from './ticket-context';

import * as perpsUtils from './ticket-perp/utils';

export const SizeSliderStop = ({ price }: { price: BigNumber | undefined }) => {
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
  const sizeOverride = form.watch('sizeOverride');

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
        if (
          sizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
        ) {
          const size = perpsUtils.calcSizeByPct({
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

          form.setValue('size', size.toString(), { shouldValidate: true });
        }

        if (
          sizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
        ) {
          form.setValue('size', value[0].toString(), { shouldValidate: true });
        }
      }}
    />
  );
};
