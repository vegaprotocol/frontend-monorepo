import { useDataProvider } from '@vegaprotocol/data-provider';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';

import { useT } from './use-t';

interface TradesContainerProps {
  marketId: string;
  gridProps: ReturnType<typeof useDataGridEvents>;
  onPriceClick: (price?: string | undefined) => void;
}

export const TradesManager = ({
  marketId,
  gridProps,
  onPriceClick,
}: TradesContainerProps) => {
  const t = useT();

  const { data, error } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    variables: { marketIds: [marketId] },
  });

  return (
    <TradesTable
      rowData={data}
      onClick={onPriceClick}
      overlayNoRowsTemplate={error ? error.message : t('No trades')}
      {...gridProps}
    />
  );
};
