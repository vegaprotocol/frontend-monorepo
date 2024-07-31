import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

export const Size = ({ name = 'size' }: { name?: 'size' | 'ocoSize' }) => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const size = form.watch(name);
  const symbol = ticket.baseSymbol;

  return (
    <DatagridRow
      label={t('Size ({{symbol}})', { symbol })}
      value={size || '-'}
    />
  );
};
