import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

export const Notional = () => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const notional = form.watch('notional');
  const symbol = ticket.quoteAsset.symbol;

  return (
    <DatagridRow
      label={
        <Tooltip description={t('ticketTooltipNotional')}>
          <span>{t('Notional ({{symbol}})', { symbol })}</span>
        </Tooltip>
      }
      value={notional || '-'}
    />
  );
};
