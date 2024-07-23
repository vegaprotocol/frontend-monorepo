import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

export const Size = () => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const size = form.watch('size');
  const symbol = ticket.baseSymbol;

  return (
    <DatagridRow
      label={t('Size ({{symbol}})', { symbol })}
      value={size || '-'}
    />
  );
};
