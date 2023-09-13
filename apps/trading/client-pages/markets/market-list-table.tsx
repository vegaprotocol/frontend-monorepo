import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid, PriceFlashCell } from '@vegaprotocol/datagrid';
import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import { useColumnDefs } from './use-column-defs';

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

const defaultColDef = {
  sortable: true,
  filter: true,
  filterParams: { buttons: ['reset'] },
};

const components = {
  PriceFlashCell,
};

type Props = TypedDataAgGrid<MarketMaybeWithData>;

export const MarketListTable = (props: Props) => {
  const columnDefs = useColumnDefs();

  return (
    <AgGrid
      getRowId={getRowId}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      components={components}
      rowHeight={45}
      {...props}
    />
  );
};

export default MarketListTable;
