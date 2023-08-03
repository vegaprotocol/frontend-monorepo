import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import {
  AgGridLazy as AgGrid,
  PriceFlashCell,
  MarketNameCell,
} from '@vegaprotocol/datagrid';
import type { MarketMaybeWithData } from '../../markets-provider';
import { OracleStatus } from './oracle-status';
import { useColumnDefs } from './use-column-defs';

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

interface MarketNameCellProps {
  value?: string;
  data?: MarketMaybeWithData;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}

const MarketName = (props: MarketNameCellProps) => (
  <>
    <MarketNameCell {...props} />
    {props.data ? (
      <OracleStatus
        dataSourceSpecForSettlementData={
          props.data.tradableInstrument.instrument.product
            .dataSourceSpecForSettlementData
        }
        dataSourceSpecForTradingTermination={
          props.data.tradableInstrument.instrument.product
            .dataSourceSpecForTradingTermination
        }
      />
    ) : null}
  </>
);

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  filterParams: { buttons: ['reset'] },
  minWidth: 100,
};
type Props = TypedDataAgGrid<MarketMaybeWithData> & {
  onMarketClick: (marketId: string, metaKey?: boolean) => void;
  SuccessorMarketRenderer?: React.FC<{ value: string }>;
};
export const MarketListTable = ({
  onMarketClick,
  SuccessorMarketRenderer,
  ...props
}: Props) => {
  const columnDefs = useColumnDefs({ onMarketClick });
  const components = {
    PriceFlashCell,
    MarketName,
    ...(SuccessorMarketRenderer ? { SuccessorMarketRenderer } : null),
  };
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      getRowId={getRowId}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      suppressCellFocus
      components={components}
      {...props}
    />
  );
};

export default MarketListTable;
