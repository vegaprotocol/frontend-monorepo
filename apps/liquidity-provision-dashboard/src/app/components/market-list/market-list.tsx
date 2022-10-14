import { useCallback, useRef, useEffect, useState } from 'react';
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
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { Market, Markets } from '@vegaprotocol/liquidity';
import { formatWithAsset } from '@vegaprotocol/liquidity';
import {
  MarketTradingModeMapping,
  MarketTradingMode,
  AuctionTrigger,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';

import { HealthBar } from './health-bar';
import { HealthDialog } from './health-dialog';

const agGridVariables = `
  .ag-theme-alpine {
    --ag-line-height: 24px;
    --ag-row-hover-color: transparent;
    --ag-header-background-color: #F5F5F5;
    --ag-odd-row-background-color: transparent;
    --ag-header-foreground-color: #000;
    --ag-secondary-foreground-color: #fff;
    --ag-font-family: "Helvetica Neue";
    --ag-font-size: 12px;

    font-family: "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .ag-theme-alpine .ag-cell {
    display: flex;
  }

  .ag-theme-alpine .ag-header {
    border: 1px solid #BFCCD6;
  }

  .ag-theme-alpine .ag-root-wrapper {
    border: none;
  }

  .ag-theme-alpine .ag-row {
    border: none;
    border-bottom: 1px solid #BFCCD6;
    font-size: 12px;
  }

  .ag-theme-alpine .ag-root-wrapper-body.ag-layout-normal {
    height: auto;
  }
`;

const displayValue = (value: string) => {
  return parseFloat(value) > 0 ? `+${value}` : value;
};

const marketNameCellRenderer = ({
  value,
  data,
}: {
  value: string;
  data: Market;
}) => {
  return (
    <>
      <span style={{ lineHeight: '12px' }}>{value}</span>
      <span style={{ lineHeight: '12px' }}>
        {data?.tradableInstrument?.instrument?.product?.settlementAsset?.symbol}
      </span>
    </>
  );
};

const healthCellRenderer = ({
  value,
  data,
}: {
  value: MarketTradingMode;
  data: Market;
}) => {
  return (
    <div>
      <HealthBar
        status={value}
        target={data.target}
        decimals={
          data.tradableInstrument.instrument.product.settlementAsset.decimals
        }
        levels={data.feeLevels}
      />
    </div>
  );
};

export const MarketList = ({ data }: { data: Markets }) => {
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const gridRef = useRef<AgGridReactType | null>(null);
  const localData = data.markets;

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
        style={{ minHeight: 500, overflow: 'hidden' }}
      >
        <AgGridReact
          rowData={localData}
          className="ag-theme-alpine h-full"
          defaultColDef={{
            resizable: true,
            sortable: true,
            unSortIcon: true,
            cellClass: ['flex', 'flex-col', 'justify-center'],
          }}
          getRowId={getRowId}
          rowHeight={92}
          ref={gridRef}
        >
          <AgGridColumn
            headerName={t('Market (futures)')}
            field="tradableInstrument.instrument.name"
            cellRenderer={marketNameCellRenderer}
            minWidth={100}
          />

          <AgGridColumn
            headerName={t('Volume (24h)')}
            field="dayVolume"
            cellRenderer={({ value, data }: GroupCellRendererParams) => {
              return (
                <div>
                  {formatNumber(value)} ({displayValue(data.volumeChange)})
                </div>
              );
            }}
          />

          <AgGridColumn
            headerName={t('Committed bond/stake')}
            field="liquidityCommitted"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              formatWithAsset(
                value,
                data.tradableInstrument.instrument.product.settlementAsset
              )
            }
          />

          <AgGridColumn
            headerName={t('Status')}
            field="tradingMode"
            valueFormatter={({
              value,
              data,
            }: {
              value: MarketTradingMode;
              data: Market;
            }) => {
              return value ===
                MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
                data.data?.trigger &&
                data.data.trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
                ? `${MarketTradingModeMapping[value]}
                     - ${AuctionTriggerMapping[data.data.trigger]}`
                : MarketTradingModeMapping[value];
            }}
          />

          <AgGridColumn
            headerComponent={() => {
              return (
                <div>
                  <span>{t('Health')}</span>{' '}
                  <button
                    onClick={() => setIsHealthDialogOpen(true)}
                    aria-label={t('open tooltip')}
                  >
                    <Icon name="info-sign" />
                  </button>
                </div>
              );
            }}
            field="tradingMode"
            cellRenderer={healthCellRenderer}
            sortable={false}
            cellStyle={{ overflow: 'unset' }}
          />
          <AgGridColumn headerName={t('Est. return / APY')} field="apy" />
        </AgGridReact>

        <HealthDialog
          isOpen={isHealthDialogOpen}
          onChange={() => {
            setIsHealthDialogOpen(!isHealthDialogOpen);
          }}
        />
      </div>
    </>
  );
};
