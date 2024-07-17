import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

export const Notional = () => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const notional = form.watch('notional');
  const symbol = ticket.quoteAsset.symbol;

  return (
    <DatagridRow
      label={t('Notional ({{symbol}})', { symbol })}
      value={notional || '-'}
    />
  );
};
