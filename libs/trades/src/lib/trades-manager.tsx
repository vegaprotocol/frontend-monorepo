import { useDataProvider } from '@vegaprotocol/data-provider';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useDealTicketFormValues } from '@vegaprotocol/deal-ticket';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useT } from './use-t';

interface TradesContainerProps {
  marketId: string;
  gridProps: ReturnType<typeof useDataGridEvents>;
}

export const TradesManager = ({
  marketId,
  gridProps,
}: TradesContainerProps) => {
  const t = useT();
  const update = useDealTicketFormValues((state) => state.updateAll);

  const { data, error } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    variables: { marketId },
  });

  return (
    <TradesTable
      rowData={data}
      onClick={(price?: string) => {
        update(marketId, { price });
      }}
      overlayNoRowsTemplate={error ? error.message : t('No trades')}
      {...gridProps}
    />
  );
};
