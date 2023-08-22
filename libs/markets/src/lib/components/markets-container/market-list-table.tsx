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
    {props.data ? <OracleStatus market={props.data} /> : null}
  </>
);

const defaultColDef = {
  sortable: true,
  filter: true,
  filterParams: { buttons: ['reset'] },
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
