import { DatagridRow } from '../elements/datagrid';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

export const Notional = ({
  name = 'notional',
}: {
  name?: 'notional' | 'ocoNotional';
}) => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const notional = form.watch(name);

  let symbol = undefined;
  switch (ticket.type) {
    case 'spot':
      symbol = ticket.quoteAsset.symbol;
      break;
    case 'default':
      symbol = ticket.settlementAsset.symbol;
      break;
  }

  return (
    <DatagridRow
      label={
        <Tooltip
          description={t('ticketTooltipNotional', {
            quoteName: symbol,
          })}
        >
          <span>{t('Notional ({{symbol}})', { symbol })}</span>
        </Tooltip>
      }
      value={notional || '-'}
    />
  );
};
