import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  volumePrefix,
  addDecimal,
  t,
  formatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, ProgressBar } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { Position } from './positions-metrics-data-provider';
import { MarketTradingMode } from '@vegaprotocol/types';

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
  valueFormatted?: [string, string, number];
}

export const ProgressBarCell = ({ valueFormatted }: PriceCellProps) => {
  return valueFormatted ? (
    <>
      <div className="flex justify-between leading-tight">
        <div>{valueFormatted[0]}</div>
        <div>{valueFormatted[1]}</div>
      </div>
      <ProgressBar value={valueFormatted[2]} className="mt-4" />
    </>
  ) : null;
};

ProgressBarCell.displayName = 'PriceFlashCell';

export interface AmountCellProps {
  valueFormatted?: { volume: string; decimalPlaces: number; notional: string };
}

export const AmountCell = ({ valueFormatted }: AmountCellProps) => {
  if (!valueFormatted) {
    return null;
  }
  const { volume, decimalPlaces, notional } = valueFormatted;
  return valueFormatted ? (
    <div className="leading-tight">
      <div
        className={classNames('text-right', {
          'color-vega-green': ({ value }: { value: string }) =>
            Number(value) > 0,
          'color-vega-red': ({ value }: { value: string }) => Number(value) < 0,
        })}
      >
        {volumePrefix(addDecimal(volume, decimalPlaces))}
      </div>
      <div className="text-right">{addDecimal(notional, decimalPlaces)}</div>
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
          const matches = value.match(/^(.*)\((.*)\)\s*$/);
          if (matches) {
            return [matches[1], matches[2]];
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
        }) => {
          if (!value || !data) {
            return undefined;
          }
          return {
            volume: value,
            decimalPlaces: data.decimalPlaces,
            notional: data.notional,
          };
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
          return addDecimal(value.toString(), data.decimalPlaces);
        }}
      />
      <AgGridColumn
        headerName={t('Entry Price')}
        field="averageEntryPrice"
        headerComponentParams={{
          template:
            '<div class="ag-cell-label-container" role="presentation">' +
            '  <div ref="eLabel" class="ag-header-cell-label" role="presentation" style="justify-content: space-between;">' +
            '    <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>' +
            `    <span>${t('Liquidation price (est)')}</span>` +
            '  </div>' +
            '</div>',
        }}
        cellRenderer="ProgressBarCell"
        valueFormatter={({
          data,
        }: PositionsTableValueFormatterParams):
          | PriceCellProps['valueFormatted']
          | undefined => {
          if (!data) {
            return undefined;
          }
          const openVolume = BigInt(data.openVolume);
          const min = BigInt(
            openVolume > 0 ? data.averageEntryPrice : data.liquidationPrice
          );
          const max = BigInt(
            openVolume > 0 ? data.averageEntryPrice : data.liquidationPrice
          );
          const mid = BigInt(data.markPrice);
          const range = max - min;
          return [
            addDecimalsFormatNumber(min.toString(), data.decimalPlaces),
            addDecimalsFormatNumber(max.toString(), data.decimalPlaces),
            range ? Number(((mid - min) * BigInt(100)) / range) : 0,
          ];
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
          return [
            `${value}%`,
            addDecimalsFormatNumber(data.totalBalance, data.decimalPlaces),
            Number(value),
          ];
        }}
      />
      <AgGridColumn
        headerName={t('Realised PNL')}
        field="realisedPNL"
        type="rightAligned"
        cellClassRules={{
          'color-vega-green': ({ value }: { value: string }) =>
            Number(value) > 0,
          'color-vega-red': ({ value }: { value: string }) => Number(value) < 0,
        }}
        valueFormatter={({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['realisedPNL'];
        }) =>
          value === undefined
            ? undefined
            : volumePrefix(
                addDecimalsFormatNumber(value.toString(), data.decimalPlaces, 3)
              )
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
