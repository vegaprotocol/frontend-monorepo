import { formatNumber, removeDecimal } from '@vegaprotocol/utils';
import { useSlippage } from '../use-slippage';
import { OrderType } from '@vegaprotocol/types';

import { useT } from '../../../lib/use-t';
import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';

export const Slippage = () => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();

  const type = form.watch('type');
  const side = form.watch('side');
  const size = form.watch('size');
  const _limitPrice = form.watch('price');

  const limitPrice =
    type === OrderType.TYPE_LIMIT
      ? removeDecimal(
          _limitPrice?.toString() || '0',
          ticket.market.decimalPlaces
        )
      : undefined;

  const order = {
    type,
    side,
    size: removeDecimal(
      size?.toString() || '0',
      ticket.market.positionDecimalPlaces
    ),
    price: limitPrice,
  };
  const slippage = useSlippage(order, ticket.market);

  const slippageVal = formatNumber(
    slippage.slippage,
    ticket.market.decimalPlaces
  );
  const slippagePct = formatNumber(slippage.slippagePct, 5);

  if (slippage.slippage === '0') {
    return (
      <DatagridRow
        label={t('Slippage ({{symbol}})', {
          symbol: ticket.quoteSymbol,
        })}
        value="-"
      />
    );
  }

  return (
    <DatagridRow
      label={t('Slippage ({{symbol}})', {
        symbol: ticket.quoteSymbol,
      })}
      value={`${slippageVal} (${slippagePct}%)`}
    />
  );
};
