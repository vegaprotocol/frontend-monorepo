import { useFormContext } from 'react-hook-form';
import BigNumber from 'bignumber.js';
import { DatagridRow } from '../elements/datagrid';
import { toBigNum } from '@vegaprotocol/utils';
import { useMarketPrice } from '@vegaprotocol/markets';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';

export const Notional = () => {
  const t = useT();
  const form = useFormContext();
  const ticket = useTicketContext();
  const sizeMode = form.watch('sizeMode');
  const size = form.watch('size');

  const { data: marketPrice } = useMarketPrice(ticket.market.id);
  const price =
    marketPrice !== undefined && marketPrice !== null
      ? toBigNum(marketPrice, ticket.market.decimalPlaces)
      : undefined;

  if (!price) {
    return (
      <DatagridRow
        label={sizeMode === 'contracts' ? t('Notional') : t('Size')}
        value="-"
      />
    );
  }

  if (sizeMode === 'contracts') {
    const value = BigNumber(size || '0')
      .times(price)
      .toString();
    return (
      <DatagridRow
        label={t('Notional ({{symbol}})', { symbol: ticket.quoteAsset.symbol })}
        value={value}
      />
    );
  } else {
    const value = BigNumber(size || '0')
      .div(price)
      .toString();
    return <DatagridRow label={t('Size')} value={value} />;
  }
};
