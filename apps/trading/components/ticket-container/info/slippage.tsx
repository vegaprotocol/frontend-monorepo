import { useFormContext } from 'react-hook-form';

import { formatNumber, removeDecimal } from '@vegaprotocol/utils';
import { useMarketPrice } from '@vegaprotocol/markets';
import { useSlippage } from '@vegaprotocol/deal-ticket';
import { OrderType } from '@vegaprotocol/types';

import { useT } from '../../../lib/use-t';
import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';

export const Slippage = () => {
  const t = useT();
  const form = useFormContext();
  const ticket = useTicketContext();

  const { data: marketPrice } = useMarketPrice(ticket.market.id);

  const type = form.watch('type');
  const side = form.watch('side');
  const size = form.watch('size');
  const limitPrice = form.watch('price');

  const price =
    type === OrderType.TYPE_LIMIT
      ? removeDecimal(limitPrice || '0', ticket.market.decimalPlaces)
      : marketPrice || undefined;

  const order = {
    type,
    side,
    size: removeDecimal(size, ticket.market.positionDecimalPlaces),
    price,
  };
  const slippage = useSlippage(order, ticket.market);

  const slippageVal = formatNumber(
    slippage.slippage,
    ticket.market.decimalPlaces
  );
  const slippagePct = formatNumber(slippage.slippagePct, 5);

  return (
    <DatagridRow
      label={t('Slippage')}
      value={`${slippagePct}% (${slippageVal})`}
    />
  );
};
