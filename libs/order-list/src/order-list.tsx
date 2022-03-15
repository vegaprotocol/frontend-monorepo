import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { GridApi, ValueFormatterParams } from 'ag-grid-community';
import { AgGridColumn } from 'ag-grid-react';
import { useEffect, useRef } from 'react';

interface Order {
  id: string;
  market: {
    id: string;
    name: string;
    tradableInstrument: {
      instrument: {
        code: string;
      };
    };
  };
  side: 'Buy' | 'Sell';
  size: string;
  type: 'Market' | 'Limit' | 'Network';
  timeInForce: 'GTC' | 'GTT' | 'IOC' | 'FOK' | 'GFN' | 'GFA';
  price: string;
  remaining: string;
  createdAt: string;
}

interface OrderListProps {
  initial: Order[];
  incoming: Order[];
}

export const OrderList = ({ initial, incoming }: OrderListProps) => {
  const gridApi = useRef<GridApi | null>(null);

  useEffect(() => {
    if (gridApi.current === null) return;

    const update: Order[] = [];
    const add: Order[] = [];

    // split into updates and adds
    incoming.forEach((o) => {
      if (!gridApi.current) return;

      const rowNode = gridApi.current.getRowNode(o.id);

      if (rowNode) {
        update.push(o);
      } else {
        add.push(o);
      }
    });

    gridApi.current.applyTransaction({
      update,
      add,
      addIndex: 0,
    });
  }, [incoming]);

  return (
    <AgGrid
      rowData={initial}
      defaultColDef={{ flex: 1 }}
      style={{ width: '100%', height: '100%' }}
      onGridReady={(params) => {
        gridApi.current = params.api;
      }}
      getRowNodeId={(data) => data.id}
    >
      <AgGridColumn field="market.tradableInstrument.instrument.code" />
      <AgGridColumn
        field="size"
        valueFormatter={(params: ValueFormatterParams) => {
          let prefix = '';
          if (params.data.side === 'Buy') {
            prefix = '+';
          } else if (params.data.side === 'Sell') {
            prefix = '-';
          }
          return prefix + params.value;
        }}
      />
      <AgGridColumn field="type" />
      <AgGridColumn field="status" />
      <AgGridColumn
        field="remaining"
        valueFormatter={(params: ValueFormatterParams) => {
          return `${Number(params.data.size) - Number(params.data.remaining)}/${
            params.data.size
          }`;
        }}
      />
      <AgGridColumn
        field="price"
        valueFormatter={(params: ValueFormatterParams) => {
          if (params.data.type === 'Market') {
            return '-';
          }
          return params.value;
        }}
      />
      <AgGridColumn field="createdAt" />
    </AgGrid>
  );
};
