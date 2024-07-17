import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const Notional = () => {
  const t = useT();
  const form = useForm();
  const notional = form.watch('notional');

  return <DatagridRow label={t('Notional')} value={notional} />;
};
