import { useCallback, useState } from 'react';
import { AgGridColumn } from 'ag-grid-react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
  GetRowIdParams,
  RowClickedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { Icon, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/liquidity';
import {
  useMarketsLiquidity,
  formatWithAsset,
  displayChange,
} from '@vegaprotocol/liquidity';
import type { MarketTradingMode } from '@vegaprotocol/types';

import { HealthBar } from '../../health-bar';
import { Grid } from '../../grid';
import { HealthDialog } from '../../health-dialog';
import { Status } from '../../status';

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

export const MarketList = () => {
  const { data, error, loading } = useMarketsLiquidity();
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.id, []);

  const localData = data?.markets;

  return (
    <AsyncRenderer loading={loading} error={error} data={localData}>
      <div
        className="grow w-full"
        style={{ minHeight: 500, overflow: 'hidden' }}
      >
        <Grid
          gridOptions={{
            onRowClicked: ({ data }: RowClickedEvent) => {
              window.open(
                `/markets/${data.id}`,
                '_blank',
                'noopener,noreferrer'
              );
            },
          }}
          rowData={localData}
          defaultColDef={{
            resizable: true,
            sortable: true,
            unSortIcon: true,
            cellClass: ['flex', 'flex-col', 'justify-center'],
          }}
          getRowId={getRowId}
          isRowClickable
        >
          <AgGridColumn
            headerName={t('Market (futures)')}
            field="tradableInstrument.instrument.name"
            cellRenderer={marketNameCellRenderer}
            minWidth={100}
            flex="1"
          />

          <AgGridColumn
            headerName={t('Volume (24h)')}
            field="dayVolume"
            cellRenderer={({ value, data }: GroupCellRendererParams) => {
              return (
                <div>
                  {formatNumber(value)} ({displayChange(data.volumeChange)})
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
            cellRenderer={({
              value,
              data,
            }: {
              value: MarketTradingMode;
              data: Market;
            }) => {
              return (
                <Status trigger={data.data?.trigger} tradingMode={value} />
              );
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
          <AgGridColumn
            headerName={t('Est. return / APY')}
            field="apy"
            cellRenderer={({ value }: GroupCellRendererParams) => {
              return (
                <div className="flex justify-between">
                  <span></span>
                  <div className="text-[#A7A7A7]">
                    <Icon name="chevron-right" />
                  </div>
                </div>
              );
            }}
          />
        </Grid>

        <HealthDialog
          isOpen={isHealthDialogOpen}
          onChange={() => {
            setIsHealthDialogOpen(!isHealthDialogOpen);
          }}
        />
      </div>
    </AsyncRenderer>
  );
};
