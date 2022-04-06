import type { AgGridReact } from 'ag-grid-react';
import { forwardRef } from 'react';
import type { TradeFields } from './__generated__/TradeFields';

interface TradesTableProps {
  data: TradeFields[] | null;
}

export const TradesTable = forwardRef<AgGridReact, TradesTableProps>(
  ({ data }, ref) => {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }
);
