import { AgGridDynamic as AgGrid, Button, Callout } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';

export function Index() {
  const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
  ];
  return (
    <div className="m-24">
      <div className="mb-24">
        <Callout
          intent="help"
          title="This is what this thing does"
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
      <AgGrid rowData={rowData} style={{ height: 400, width: 600 }}>
        <AgGridColumn field="make"></AgGridColumn>
        <AgGridColumn field="model"></AgGridColumn>
        <AgGridColumn field="price"></AgGridColumn>
      </AgGrid>      
    </div>
  );
}

export default Index;
