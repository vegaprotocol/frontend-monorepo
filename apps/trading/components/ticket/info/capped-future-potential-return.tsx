import BigNumber from 'bignumber.js';
import { toBigNum } from '@vegaprotocol/utils';
import { isFuture } from '@vegaprotocol/markets';

import { useT } from '../../../lib/use-t';
import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';

export const CappedFuturePotentialReturn = () => {
  const t = useT();
  const ticket = useTicketContext('default');
  const form = useForm();
  const size = form.watch('size');

  const product = ticket.market.tradableInstrument.instrument.product;
  if (isFuture(product) && product.cap) {
    const priceCap = toBigNum(
      product.cap.maxPrice,
      ticket.market.decimalPlaces
    );
    const potentialReturn = BigNumber(size || 0)
      .times(priceCap)
      .toString();

    return (
      <DatagridRow label={t('Potential return')} value={potentialReturn} />
    );
  }

  return null;
};
