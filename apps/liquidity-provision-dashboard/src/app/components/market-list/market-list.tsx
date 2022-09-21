import React, { useState, useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
// import type { AgGridReact } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';

import type { MarketTradingMode } from '@vegaprotocol/types';
import { MarketTradingModeMapping } from '@vegaprotocol/types';
// import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
// import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

interface Markets {
  data: {
    id: string;
    name: string;
    status: string;
  }[];
}

const MarketList = ({ data }: Markets) => {
  console.log('market data: ', data);

  const marketNameCellRenderer = (props: GroupCellRendererParams) => {
    const { value, data } = props;

    return (
      <div className="flex flex-col">
        <div>{value}</div>
        <div>{data?.settlementAsset}</div>
      </div>
    );
  };

  const healthCellRenderer = ({ value }: GroupCellRendererParams) => {
    return (
      <div>
        <div>{value}</div>
      </div>
    );
  };

  return (
    <div
      className="px-6 py-6 ag-theme-alpine grow"
      data-testid="market-list"
      style={{ height: 500, overflow: 'hidden', flexGrow: 1 }}
    >
      <AgGrid
        rowData={data}
        defaultColDef={{
          sortable: true,
          unSortIcon: true,
        }}
        className="h-full"
        rowHeight={52}
      >
        <AgGridColumn
          headerName={t('Market (futures)')}
          field="name"
          headerTooltip={t('This is the tooltip')}
          cellRenderer={marketNameCellRenderer}
        />
        <AgGridColumn
          headerName={t('Volume 24h')}
          field="volume"
          headerTooltip={t('This is the volume tooltip')}
        />
        <AgGridColumn
          headerName={t('Committed liquidity')}
          field="liquidity"
          headerTooltip={t('This is the liquidity tooltip')}
        />
        <AgGridColumn
          headerName={t('Status')}
          field="status"
          headerTooltip={t('This is the status tooltip')}
          valueFormatter={({ value }: { value: MarketTradingMode }) =>
            `${MarketTradingModeMapping[value]}`
          }
        />
        <AgGridColumn
          headerName={t('Health')}
          field="health"
          headerTooltip={t('This is the health tooltip')}
          cellRenderer={healthCellRenderer}
        />
        <AgGridColumn
          headerName={t('Est. return / APY')}
          field="apy"
          headerTooltip={t('This is the APY tooltip')}
        />
      </AgGrid>
    </div>
  );
};

export default MarketList;
