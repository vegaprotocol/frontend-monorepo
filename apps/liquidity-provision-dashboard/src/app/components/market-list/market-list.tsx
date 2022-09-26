import React, { useState, useMemo, useCallback } from 'react';
import { t } from '@vegaprotocol/react-helpers';
// import type { AgGridReact } from 'ag-grid-react';
//import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { GetRowIdParams } from 'ag-grid-community/dist/lib/entities/iCallbackParams';

import type { MarketsListData } from '@vegaprotocol/liquidity-provision';
import {
  formatWithAsset,
  mapMarketLists,
} from '@vegaprotocol/liquidity-provision';

import type { MarketTradingMode } from '@vegaprotocol/types';
import { MarketTradingModeMapping } from '@vegaprotocol/types';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const agGridVariables = `
  .ag-theme-alpine {
    --ag-line-height: 24px;
  }

  .ag-theme-alpine .ag-cell {
    display: flex;
  }
`;

const MarketList = ({ data }: { data: MarketsListData }) => {
  const localData = mapMarketLists(data.markets);

  const marketNameCellRenderer = (props: GroupCellRendererParams) => {
    const { value, data } = props;

    return (
      <>
        <span style={{ lineHeight: '25px' }}>{value}</span>
        <span style={{ lineHeight: '25px' }}>
          {
            data?.tradableInstrument?.instrument?.product?.settlementAsset
              ?.symbol
          }
        </span>
      </>
    );
  };

  const healthCellRenderer = ({ value }: GroupCellRendererParams) => {
    return (
      <div>
        <div>{value}</div>
      </div>
    );
  };

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.id, []);

  return (
    <>
      <style>{agGridVariables}</style>
      <div
        className="px-6 py-6 grow"
        data-testid="market-list"
        style={{ height: 500, overflow: 'hidden', flexGrow: 1 }}
      >
        <AgGridReact
          rowData={localData}
          className="ag-theme-alpine h-full"
          defaultColDef={{
            sortable: true,
            unSortIcon: true,
            cellClass: ['flex', 'flex-col', 'justify-center'],
          }}
          getRowId={getRowId}
          rowHeight={80}
        >
          <AgGridColumn
            headerName={t('Market (futures) TEST')}
            field="tradableInstrument.instrument.name"
            headerTooltip={t('This is the tooltip')}
            cellRenderer={marketNameCellRenderer}
            flex={1}
          />
          <AgGridColumn
            headerName={t('Volume 24h')}
            field="volume"
            headerTooltip={t('This is the volume tooltip')}
            cellRenderer={({ value }: GroupCellRendererParams) => {
              //TODO: get from candles
              // const dayVolume = calcCandleVolume(market);
              return '0';
            }}
          />

          <AgGridColumn
            headerName={t('Committed liquidity')}
            field="liquidityCommitted"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              formatWithAsset(value, data)
            }
          />

          <AgGridColumn
            headerName={t('Status')}
            field="tradingMode"
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
            sortable={false}
          />
          <AgGridColumn
            headerName={t('Est. return / APY')}
            field="apy"
            headerTooltip={t('This is the APY tooltip')}
          />
        </AgGridReact>
      </div>
    </>
  );
};

{
  /* <MarketInfoTable
  data={{
    '24hourVolume':
      dayVolume && dayVolume !== '0' ? formatNumber(dayVolume) : '-',
    ...pick(
      market.data,
      'openInterest',
      'name',
      'bestBidVolume',
      'bestOfferVolume',
      'bestStaticBidVolume',
      'bestStaticOfferVolume'
    ),
  }}
  decimalPlaces={market.positionDecimalPlaces}
/>; */
}

{
  /* <AgGridColumn
  headerName={t('Committed liquidity')}
  cellRenderer={({ data }: GroupCellRendererParams) => {
    return formatStake(data.marketData.suppliedStake, data);
  }}
/>; */
}

export default MarketList;
