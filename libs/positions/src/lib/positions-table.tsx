import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  volumePrefix,
  t,
  formatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, ProgressBar } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { Position } from './data-providers';
import { MarketTradingMode } from '@vegaprotocol/types';
import { Intent } from '@vegaprotocol/ui-toolkit';

export const getRowId = ({ data }: { data: Position }) => data.marketId;

export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: Position[], lastRow?: number): void;
}

export interface Datasource extends IDatasource {
  getRows(params: GetRowsParams): void;
}
interface Props extends AgGridReactProps {
  rowData?: Position[] | null;
  datasource?: Datasource;
}

type PositionsTableValueFormatterParams = Omit<
  ValueFormatterParams,
  'data' | 'value'
> & {
  data: Position;
};

export interface MarketNameCellProps {
  valueFormatted?: [string, string];
}

export const MarketNameCell = ({ valueFormatted }: MarketNameCellProps) => {
  return valueFormatted ? (
    <div className="leading-tight">
      <div>{valueFormatted[0]}</div>
      {valueFormatted[1] ? <div>{valueFormatted[1]}</div> : null}
    </div>
  ) : null;
};

export interface PriceCellProps {
  valueFormatted?: {
    low: string;
    high: string;
    value: number;
    intent?: Intent;
  };
}

export const ProgressBarCell = ({ valueFormatted }: PriceCellProps) => {
  return valueFormatted ? (
    <>
      <div className="flex justify-between leading-tight">
        <div>{valueFormatted.low}</div>
        <div>{valueFormatted.high}</div>
      </div>
      <ProgressBar
        value={valueFormatted.value}
        intent={valueFormatted.intent}
        className="mt-4"
      />
    </>
  ) : null;
};

ProgressBarCell.displayName = 'PriceFlashCell';

export interface AmountCellProps {
  valueFormatted?: Pick<
    Position,
    'openVolume' | 'marketDecimalPlaces' | 'positionDecimalPlaces' | 'notional'
  >;
}

export const AmountCell = ({ valueFormatted }: AmountCellProps) => {
  if (!valueFormatted) {
    return null;
  }
  const { openVolume, positionDecimalPlaces, marketDecimalPlaces, notional } =
    valueFormatted;
  const isShortPosition = openVolume.startsWith('-');
  return valueFormatted ? (
    <div className="leading-tight">
      <div
        className={classNames('text-right', {
          'text-vega-green-dark dark:text-vega-green': !isShortPosition,
          'text-vega-red-dark dark:text-vega-red': isShortPosition,
        })}
      >
        {volumePrefix(
          addDecimalsFormatNumber(openVolume, positionDecimalPlaces)
        )}
      </div>
      <div className="text-right">
        {addDecimalsFormatNumber(notional, marketDecimalPlaces)}
      </div>
    </div>
  ) : null;
};

AmountCell.displayName = 'AmountCell';

export const PositionsTable = forwardRef<AgGridReact, Props>((props, ref) => {
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate="No positions"
      getRowId={getRowId}
      rowHeight={34}
      ref={ref}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      components={{ PriceFlashCell, ProgressBarCell }}
      {...props}
    >
      <AgGridColumn
        headerName={t('Market')}
        field="marketName"
        cellRenderer={MarketNameCell}
        valueFormatter={({
          value,
        }: PositionsTableValueFormatterParams & {
          value: Position['marketName'];
        }) => {
          if (!value) {
            return undefined;
          }
          // split market name into two parts, 'Part1 (Part2)'
          const matches = value.match(/^(.*)\((.*)\)\s*$/);
          if (matches) {
            return [matches[1].trim(), matches[2].trim()];
          }
          return [value];
        }}
      />
      <AgGridColumn
        headerName={t('Amount')}
        field="openVolume"
        type="rightAligned"
        cellRenderer={AmountCell}
        valueFormatter={({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['openVolume'];
        }): AmountCellProps['valueFormatted'] => {
          if (!value || !data) {
            return undefined;
          }
          return data;
        }}
      />
      <AgGridColumn
        headerName={t('Mark Price')}
        field="markPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        valueFormatter={({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['markPrice'];
        }) => {
          if (!data) {
            return undefined;
          }
          if (data.marketTradingMode === MarketTradingMode.OpeningAuction) {
            return '-';
          }
          return addDecimalsFormatNumber(
            value.toString(),
            data.marketDecimalPlaces
          );
        }}
      />
      <AgGridColumn
        headerName={t('Entry Price')}
        field="averageEntryPrice"
        headerComponentParams={{
          template:
            '<div class="ag-cell-label-container" role="presentation">' +
            `  <span>${t('Liquidation price (est)')}</span>` +
            '  <span ref="eText" class="ag-header-cell-text"></span>' +
            '</div>',
        }}
        flex={2}
        cellRenderer="ProgressBarCell"
        valueFormatter={({
          data,
        }: PositionsTableValueFormatterParams):
          | PriceCellProps['valueFormatted']
          | undefined => {
          if (!data) {
            return undefined;
          }
          const min = BigInt(data.averageEntryPrice);
          const max = BigInt(data.liquidationPrice);
          const mid = BigInt(data.markPrice);
          const range = max - min;
          return {
            low: addDecimalsFormatNumber(
              min.toString(),
              data.marketDecimalPlaces
            ),
            high: addDecimalsFormatNumber(
              max.toString(),
              data.marketDecimalPlaces
            ),
            value: range ? Number(((mid - min) * BigInt(100)) / range) : 0,
            intent: data.lowMarginLevel ? Intent.Danger : undefined,
          };
        }}
      />
      <AgGridColumn
        headerName={t('Leverage')}
        field="currentLeverage"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        valueFormatter={({
          value,
        }: PositionsTableValueFormatterParams & {
          value: Position['currentLeverage'];
        }) =>
          value === undefined ? undefined : formatNumber(value.toString(), 1)
        }
      />
      <AgGridColumn
        headerName={t('Margin allocated')}
        field="capitalUtilisation"
        type="rightAligned"
        flex={2}
        cellRenderer="ProgressBarCell"
        valueFormatter={({
          data,
          value,
        }: PositionsTableValueFormatterParams & {
          value: Position['capitalUtilisation'];
        }): PriceCellProps['valueFormatted'] | undefined => {
          if (!data) {
            return undefined;
          }
          return {
            low: `${formatNumber(value, 2)}%`,
            high: addDecimalsFormatNumber(
              data.totalBalance,
              data.assetDecimals
            ),
            value: Number(value),
          };
        }}
      />
      <AgGridColumn
        headerName={t('Realised PNL')}
        field="realisedPNL"
        type="rightAligned"
        cellClassRules={{
          'text-vega-green-dark dark:text-vega-green': ({
            value,
          }: {
            value: string;
          }) => BigInt(value) > 0,
          'text-vega-red-dark dark:text-vega-red': ({
            value,
          }: {
            value: string;
          }) => BigInt(value) < 0,
        }}
        valueFormatter={({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['realisedPNL'];
        }) =>
          value === undefined
            ? undefined
            : addDecimalsFormatNumber(value.toString(), data.assetDecimals)
        }
        cellRenderer="PriceFlashCell"
        headerTooltip={t('P&L excludes any fees paid.')}
      />
      <AgGridColumn
        headerName={t('Unrealised PNL')}
        field="unrealisedPNL"
        type="rightAligned"
        cellClassRules={{
          'text-vega-green-dark dark:text-vega-green': ({
            value,
          }: {
            value: string;
          }) => BigInt(value) > 0,
          'text-vega-red-dark dark:text-vega-red': ({
            value,
          }: {
            value: string;
          }) => BigInt(value) < 0,
        }}
        valueFormatter={({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['unrealisedPNL'];
        }) =>
          value === undefined
            ? undefined
            : addDecimalsFormatNumber(value.toString(), data.assetDecimals)
        }
        cellRenderer="PriceFlashCell"
      />
      <AgGridColumn
        headerName={t('Updated')}
        field="updatedAt"
        type="rightAligned"
        valueFormatter={({
          value,
        }: PositionsTableValueFormatterParams & {
          value: Position['updatedAt'];
        }) => {
          if (!value) {
            return value;
          }
          return getDateTimeFormat().format(new Date(value));
        }}
      />
    </AgGrid>
  );
});

export default PositionsTable;
