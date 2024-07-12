import BigNumber from 'bignumber.js';
import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';

export const Notional = ({ price }: { price: BigNumber | undefined }) => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const sizeMode = form.watch('sizeMode');
  const size = form.watch('size');

  if (!price || price.isNaN() || price.isZero()) {
    return (
      <DatagridRow
        label={sizeMode === 'contracts' ? t('Notional') : t('Size')}
        value="-"
      />
    );
  }

  if (sizeMode === 'contracts') {
    const value = size ? BigNumber(size).times(price).toString() : '-';
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
