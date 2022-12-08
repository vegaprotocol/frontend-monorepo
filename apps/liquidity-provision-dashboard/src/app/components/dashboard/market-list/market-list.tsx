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
  t,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import type { Schema } from '@vegaprotocol/types';
import {
  AsyncRenderer,
  Icon,
  PriceCellChange,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import type {
  GetRowIdParams,
  RowClickedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { AgGridColumn } from 'ag-grid-react';
import { useCallback, useState } from 'react';

import { Grid } from '../../grid';
import { HealthBar } from '../../health-bar';
import { HealthDialog } from '../../health-dialog';
import { Status } from '../../status';

export const MarketList = () => {
  const { data, error, loading } = useMarketsLiquidity();
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const consoleLink = useLinks(DApp.Console);

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
                liquidityDetailsConsoleLink(data.id, consoleLink),
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
            tooltipComponent: TooltipCellComponent,
          }}
          getRowId={getRowId}
          isRowClickable
          tooltipShowDelay={500}
        >
          <AgGridColumn
            headerName={t('Market (futures)')}
            field="tradableInstrument.instrument.name"
            cellRenderer={({
              value,
              data,
            }: {
              value: string;
              data: Market;
            }) => {
              return (
                <>
                  <span className="leading-3">{value}</span>
                  <span className="leading-3">
                    {
                      data?.tradableInstrument?.instrument?.product
                        ?.settlementAsset?.symbol
                    }
                  </span>
                </>
              );
            }}
            minWidth={100}
            flex="1"
            headerTooltip={t('The market name and settlement asset')}
          />

          <AgGridColumn
            headerName={t('Market Code')}
            headerTooltip={t(
              'The market code is a unique identifier for this market'
            )}
            field="tradableInstrument.instrument.code"
          />

          <AgGridColumn
            headerName={t('Type')}
            headerTooltip={t('Type')}
            field="tradableInstrument.instrument.product.__typename"
          />

          <AgGridColumn
            headerName={t('Last Price')}
            headerTooltip={t('Latest price for this market')}
            field="data.markPrice"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              formatWithAsset(
                value,
                data.tradableInstrument.instrument.product.settlementAsset
              )
            }
          />

          <AgGridColumn
            headerName={t('Change (24h)')}
            headerTooltip={t('Change in price over the last 24h')}
            cellRenderer={({ data }: { data: Market }) => {
              if (data.candles) {
                const prices = data.candles.map((candle) => candle.close);
                return (
                  <PriceCellChange
                    candles={prices}
                    decimalPlaces={data?.decimalPlaces}
                  />
                );
              } else return <div>{t('No data')}</div>;
            }}
          />

          <AgGridColumn
            headerName={t('Volume (24h)')}
            field="dayVolume"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              `${addDecimalsFormatNumber(
                value,
                data.tradableInstrument.instrument.product.settlementAsset
                  .decimals
              )} (${displayChange(data.volumeChange)})`
            }
            headerTooltip={t('The trade volume over the last 24h')}
          />

          <AgGridColumn
            headerName={t('Total staked by LPs')}
            field="liquidityCommitted"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              formatWithAsset(
                value,
                data.tradableInstrument.instrument.product.settlementAsset
              )
            }
            headerTooltip={t(
              'The amount of funds allocated to provide liquidity'
            )}
          />

          <AgGridColumn
            headerName={t('Target stake')}
            field="target"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              formatWithAsset(
                value,
                data.tradableInstrument.instrument.product.settlementAsset
              )
            }
            headerTooltip={t(
              'The ideal committed liquidity to operate the market.  If total commitment currently below this level then LPs can set the fee level with new commitment.'
            )}
          />

          <AgGridColumn
            headerName={t('% Target stake met')}
            valueFormatter={({ data }: ValueFormatterParams) => {
              const roundedPercentage =
                parseInt(
                  (data.liquidityCommitted / parseFloat(data.target)).toFixed(0)
                ) * 100;
              const display = Number.isNaN(roundedPercentage)
                ? 'N/A'
                : formatNumberPercentage(toBigNum(roundedPercentage, 2));
              return display;
            }}
            headerTooltip={t('% Target stake met')}
          />

          <AgGridColumn
            headerName={t('Fee levels')}
            field="fees"
            valueFormatter={({ value, data }: ValueFormatterParams) =>
              `${value.factors.liquidityFee}%`
            }
            headerTooltip={t('Fee level for this market')}
          />

          <AgGridColumn
            headerName={t('Status')}
            field="tradingMode"
            cellRenderer={({
              value,
              data,
            }: {
              value: Schema.MarketTradingMode;
              data: Market;
            }) => {
              return (
                <Status trigger={data.data?.trigger} tradingMode={value} />
              );
            }}
            headerTooltip={t(
              'The current market status - those below the target stake mark are most in need of liquidity'
            )}
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
            cellRenderer={({
              value,
              data,
            }: {
              value: Schema.MarketTradingMode;
              data: Market;
            }) => (
              <HealthBar
                status={value}
                target={data.target}
                decimals={
                  data.tradableInstrument.instrument.product.settlementAsset
                    .decimals
                }
                levels={data.feeLevels}
              />
            )}
            sortable={false}
            cellStyle={{ overflow: 'unset' }}
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

const liquidityDetailsConsoleLink = (
  marketId: string,
  consoleLink: (url: string | undefined) => string
) => consoleLink(`/#/liquidity/${marketId}`);
