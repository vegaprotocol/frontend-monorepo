import {
  AgGridDynamic as AgGrid,
  Button,
  Callout,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import type { GridApi } from 'ag-grid-community';
import { AgGridColumn } from 'ag-grid-react';
import { useState, useEffect, useRef } from 'react';
import { useApplyGridTransaction } from '@vegaprotocol/react-helpers';

const Grid = () => {
  const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
  ];
  const ref = useRef(rowData);
  const getRowNodeId = (data: { make: string }) => data.make;
  const gridApi = useRef<GridApi | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gridApi) return;
      const update = [];
      const add = [];

      // split into updates and adds
      [...rowData].forEach((data) => {
        if (!gridApi.current) return;

        const rowNode = gridApi.current.getRowNode(getRowNodeId(data));

        if (rowNode) {
          if (rowNode.data !== data) {
            update.push(data);
          }
        } else {
          add.push(data);
        }
      });
      // async transaction for optimal handling of high grequency updates
      if (update.length || add.length) {
        gridApi.current.applyTransaction({
          update,
          add,
          addIndex: 0,
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  });
  return (
    <AgGrid
      onGridReady={(params) => {
        gridApi.current = params.api;
      }}
      getRowNodeId={getRowNodeId}
      rowData={ref.current}
      style={{ height: 400, width: 600 }}
    >
      <AgGridColumn field="make"></AgGridColumn>
      <AgGridColumn field="model"></AgGridColumn>
      <AgGridColumn field="price"></AgGridColumn>
    </AgGrid>
  );
};

export function Index() {
  return (
    <div className="m-24">
      <div className="mb-24">
        <Callout
          intent={Intent.Help}
          title="Welcome to Vega Trading App"
          iconName="endorsed"
          headingLevel={1}
        >
          <div className="flex flex-col">
            <div>With a longer explaination</div>
            <Button className="block mt-8" variant="secondary">
              Action
            </Button>
          </div>
        </Callout>
      </div>
      <Grid />
    </div>
  );
}

export default Index;
