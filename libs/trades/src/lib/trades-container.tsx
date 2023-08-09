import { useDataProvider } from '@vegaprotocol/data-provider';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useDealTicketFormValues } from '@vegaprotocol/deal-ticket';
import { t } from '@vegaprotocol/i18n';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
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
    />
  );
};
