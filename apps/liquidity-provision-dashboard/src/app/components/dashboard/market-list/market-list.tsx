import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridColumn } from 'ag-grid-react';
import type {
  ValueFormatterParams,
  GetRowIdParams,
  RowClickedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { t, addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import {
  Icon,
  AsyncRenderer,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/liquidity';
import {
  useMarketsLiquidity,
  formatWithAsset,
  displayChange,
} from '@vegaprotocol/liquidity';
import type { Schema } from '@vegaprotocol/types';

import { HealthBar } from '../../health-bar';
import { Grid } from '../../grid';
import { HealthDialog } from '../../health-dialog';
import { Status } from '../../status';

export const MarketList = () => {
  const { data, error, loading } = useMarketsLiquidity();
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const navigate = useNavigate();

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
              navigate(`/markets/${data.id}`);
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
            headerName={t('Committed bond')}
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
          <AgGridColumn
            headerName={t('Est. return / APY')}
            field="apy"
            headerTooltip={t(
              'An annualised estimate based on the total liquidity provision fees and maker fees collected by liquidity providers, the maximum margin needed and maximum commitment (bond) over the course of 7 epochs'
            )}
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
