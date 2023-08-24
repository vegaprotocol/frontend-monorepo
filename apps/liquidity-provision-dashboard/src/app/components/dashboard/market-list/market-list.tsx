import { DApp, useLinks } from '@vegaprotocol/environment';
import type { Market } from '@vegaprotocol/liquidity';
import {
  displayChange,
  formatWithAsset,
  useMarketsLiquidity,
} from '@vegaprotocol/liquidity';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  getExpiryDate,
  toBigNum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { VegaValueFormatterParams } from '@vegaprotocol/datagrid';
import { PriceChangeCell } from '@vegaprotocol/datagrid';
import type * as Schema from '@vegaprotocol/types';
import {
  AsyncRenderer,
  Icon,
  HealthBar,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import type {
  GetRowIdParams,
  RowClickedEvent,
  ColDef,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useCallback, useState, useMemo } from 'react';

import { Grid } from '../../grid';
import { HealthDialog } from '../../health-dialog';
import { Status } from '../../status';
import { intentForStatus } from '../../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { getAsset } from '@vegaprotocol/markets';

export const MarketList = () => {
  const { data, error, loading } = useMarketsLiquidity();
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const consoleLink = useLinks(DApp.Console);

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.id, []);
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Market (futures)'),
        field: 'tradableInstrument.instrument.name',
        cellRenderer: ({ value, data }: { value: string; data: Market }) => {
          return (
            <>
              <span className="leading-3">{value}</span>
              <span className="leading-3">{getAsset(data).symbol}</span>
            </>
          );
        },
        minWidth: 100,
        flex: 1,
        headerTooltip: t('The market name and settlement asset'),
      },

      {
        headerName: t('Market Code'),
        headerTooltip: t(
          'The market code is a unique identifier for this market'
        ),
        field: 'tradableInstrument.instrument.code',
      },

      {
        headerName: t('Type'),
        headerTooltip: t('Type'),
        field: 'tradableInstrument.instrument.product.__typename',
      },

      {
        headerName: t('Last Price'),
        headerTooltip: t('Latest price for this market'),
        field: 'data.markPrice',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Market, 'data.markPrice'>) =>
          value && data ? formatWithAsset(value, getAsset(data)) : '-',
      },

      {
        headerName: t('Change (24h)'),
        headerTooltip: t('Change in price over the last 24h'),
        cellRenderer: ({
          data,
        }: VegaValueFormatterParams<Market, 'data.candles'>) => {
          if (data && data.candles) {
            const prices = data.candles.map((candle) => candle.close);
            return (
              <PriceChangeCell
                candles={prices}
                decimalPlaces={data?.decimalPlaces}
              />
            );
          } else return <div>{t('-')}</div>;
        },
      },

      {
        headerName: t('Volume (24h)'),
        field: 'dayVolume',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Market, 'dayVolume'>) =>
          value && data
            ? `${addDecimalsFormatNumber(
                value,
                getAsset(data).decimals || 0
              )} (${displayChange(data.volumeChange)})`
            : '-',
        headerTooltip: t('The trade volume over the last 24h'),
      },

      {
        headerName: t('Total staked by LPs'),
        field: 'liquidityCommitted',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Market, 'liquidityCommitted'>) =>
          data && value
            ? formatWithAsset(value.toString(), getAsset(data))
            : '-',
        headerTooltip: t('The amount of funds allocated to provide liquidity'),
      },

      {
        headerName: t('Target stake'),
        field: 'target',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Market, 'target'>) =>
          data && value ? formatWithAsset(value, getAsset(data)) : '-',
        headerTooltip: t(
          'The ideal committed liquidity to operate the market.  If total commitment currently below this level then LPs can set the fee level with new commitment.'
        ),
      },

      {
        headerName: t('% Target stake met'),
        valueFormatter: ({ data }: VegaValueFormatterParams<Market, ''>) => {
          if (data) {
            const roundedPercentage =
              parseInt(
                (data.liquidityCommitted / parseFloat(data.target)).toFixed(0)
              ) * 100;
            const display = Number.isNaN(roundedPercentage)
              ? 'N/A'
              : formatNumberPercentage(toBigNum(roundedPercentage, 0), 0);
            return display;
          } else return '-';
        },
        headerTooltip: t('% Target stake met'),
      },

      {
        headerName: t('Fee levels'),
        field: 'fees',
        valueFormatter: ({ value }: VegaValueFormatterParams<Market, 'fees'>) =>
          value ? `${value.factors.liquidityFee}%` : '-',
        headerTooltip: t('Fee level for this market'),
      },

      {
        headerName: t('Status'),
        field: 'tradingMode',
        cellRenderer: ({
          value,
          data,
        }: {
          value: Schema.MarketTradingMode;
          data: Market;
        }) => {
          return <Status trigger={data.data?.trigger} tradingMode={value} />;
        },
        headerTooltip: t(
          'The current market status - those below the target stake mark are most in need of liquidity'
        ),
      },

      {
        headerComponent: () => {
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
        },
        field: 'tradingMode',
        cellRenderer: ({
          value,
          data,
        }: {
          value: Schema.MarketTradingMode;
          data: Market;
        }) => (
          <HealthBar
            target={data.target}
            decimals={getAsset(data).decimals || 0}
            levels={data.feeLevels}
            intent={intentForStatus(value)}
          />
        ),
        sortable: false,
        cellStyle: { overflow: 'unset' },
      },
      {
        headerName: t('Age'),
        field: 'marketTimestamps.open',
        headerTooltip: t('Age of the market'),
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<Market, 'marketTimestamps.open'>) => {
          return value ? formatDistanceToNow(new Date(value)) : '-';
        },
      },
      {
        headerName: t('Closing Time'),
        field: 'tradableInstrument.instrument.metadata.tags',
        headerTooltip: t('Closing time of the market'),
        valueFormatter: ({ data }: VegaValueFormatterParams<Market, ''>) => {
          let expiry;
          if (data?.tradableInstrument.instrument.metadata.tags) {
            expiry = getExpiryDate(
              data?.tradableInstrument.instrument.metadata.tags,
              data?.marketTimestamps.close,
              data?.state
            );
          }
          return expiry ? expiry : '-';
        },
      },
    ],
    []
  );

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div
        className="grow w-full"
        style={{ minHeight: 500, overflow: 'hidden' }}
      >
        <Grid
          gridOptions={{
            onRowClicked: ({ data }: RowClickedEvent) => {
              window.open(
                liquidityDetailsConsoleLink(data.id, consoleLink),
                '_blank',
                'noopener,noreferrer'
              );
            },
          }}
          rowData={data}
          defaultColDef={{
            resizable: true,
            sortable: true,
            unSortIcon: true,
            cellClass: ['flex', 'flex-col', 'justify-center'],
            tooltipComponent: TooltipCellComponent,
          }}
          columnDefs={columnDefs}
          getRowId={getRowId}
          isRowClickable
          tooltipShowDelay={500}
        />
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

const liquidityDetailsConsoleLink = (
  marketId: string,
  consoleLink: (url: string | undefined) => string
) => consoleLink(`/#/liquidity/${marketId}`);
