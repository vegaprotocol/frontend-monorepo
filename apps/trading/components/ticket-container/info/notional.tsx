import { useFormContext } from 'react-hook-form';
import BigNumber from 'bignumber.js';
import { DatagridRow } from '../elements/datagrid';
import { useT } from '../../../lib/use-t';

export const Notional = ({ price }: { price?: BigNumber }) => {
  const t = useT();
  const form = useFormContext();
  const mode = form.watch('mode');
  const size = form.watch('size');

  let value: string;

  if (!price) {
    value = 'N/A';
  } else {
    if (mode === 'size') {
      value = BigNumber(size || '0')
        .times(price)
        .toString();
    } else {
      value = BigNumber(size || '0')
        .div(price)
        .toString();
    }
  }

  if (mode === 'size') {
    return <DatagridRow label={t('Notional')} value={value} />;
  } else {
    return <DatagridRow label={t('Size')} value={value} />;
  }
};
