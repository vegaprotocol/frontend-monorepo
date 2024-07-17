import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const Size = () => {
  const t = useT();
  const form = useForm();
  const size = form.watch('size');

  return <DatagridRow label={t('Size')} value={size} />;
};
