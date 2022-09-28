import { useCallback, useRef, useEffect } from 'react';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import type { AgGridReact as AgGridReactType } from 'ag-grid-react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
  GetRowIdParams,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { formatNumber, t } from '@vegaprotocol/react-helpers';

import {
  formatWithAsset,
  formatMarketLists,
} from '@vegaprotocol/liquidity-provision';

import type { MarketsListData } from '@vegaprotocol/liquidity-provision';
import type { MarketTradingMode } from '@vegaprotocol/types';
import { MarketTradingModeMapping } from '@vegaprotocol/types';

const agGridVariables = `
  .ag-theme-alpine {
    --ag-line-height: 24px;
  }

  .ag-theme-alpine .ag-cell {
    display: flex;
  }
`;

const displayValue = (value: string) => {
  return parseFloat(value) > 0 ? `+${value}` : value;
};

const marketNameCellRenderer = (props: GroupCellRendererParams) => {
  const { value, data } = props;

  return (
    <>
      <span style={{ lineHeight: '25px' }}>{value}</span>
      <span style={{ lineHeight: '25px' }}>
        {data?.tradableInstrument?.instrument?.product?.settlementAsset?.symbol}
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

const MarketList = ({ data }: { data: MarketsListData }) => {
  const gridRef = useRef<AgGridReactType | null>(null);
  const localData = formatMarketLists(data);

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.id, []);

  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);

  useEffect(() => {
    window.addEventListener('resize', handleOnGridReady);
    return () => window.removeEventListener('resize', handleOnGridReady);
  }, [handleOnGridReady]);

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
          ref={gridRef}
        >
          <AgGridColumn
            headerName={t('Market (futures)')}
            field="tradableInstrument.instrument.name"
            headerTooltip={t('This is the tooltip')}
            cellRenderer={marketNameCellRenderer}
            flex={1}
          />

          <AgGridColumn
            headerName={t('Volume 24h')}
            field="dayVolume"
            headerTooltip={t('This is the volume tooltip')}
            cellRenderer={({ value, data }: GroupCellRendererParams) => {
              return (
                <div>
                  {formatNumber(value)} ({displayValue(data.volumeChange)})
                </div>
              );
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

export default MarketList;
