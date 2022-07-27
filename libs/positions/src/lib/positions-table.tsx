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

export interface PriceCellProps {
  valueFormatted?: [string, string, number];
}

export const ProgressBarCell = ({ valueFormatted }: PriceCellProps) => {
  return valueFormatted ? (
    <div className="font-mono">
      <div className="float-left">${valueFormatted[0]}</div>
      <div className="float-right">${valueFormatted[1]}</div>
      <ProgressBar value={valueFormatted[2]} />
    </div>
  ) : (
    ''
  );
};

ProgressBarCell.displayName = 'PriceFlashCell';

export const PositionsTable = forwardRef<AgGridReact, Props>((props, ref) => {
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate="No positions"
      getRowId={getRowId}
      ref={ref}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      components={{ PriceFlashCell, ProgressBarCell }}
      {...props}
    >
      <AgGridColumn headerName={t('Market')} field="name" />
      <AgGridColumn
        headerName={t('Amount')}
        field="openVolume"
        valueFormatter={({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['openVolume'];
        }) => {
          if (!data) {
            return undefined;
          }
          return (
            <>
              <div
                className={classNames('text-right', {
                  'color-vega-green': ({ value }: { value: string }) =>
                    Number(value) > 0,
                  'color-vega-red': ({ value }: { value: string }) =>
                    Number(value) < 0,
                })}
              >
                {volumePrefix(addDecimal(value.toString(), data.decimalPlaces))}
              </div>
              <div className="text-right">
                {addDecimal(data.notional.toString(), data.decimalPlaces)}
              </div>
            </>
          );
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
        valueFormatter={({ data }: PositionsTableValueFormatterParams) => {
          if (!data) {
            return undefined;
          }
          const min =
            data.openVolume > 0
              ? data.averageEntryPrice
              : data.liquidationPrice;
          const max =
            data.openVolume > 0
              ? data.averageEntryPrice
              : data.liquidationPrice;
          const mid = data.markPrice;
          return [
            addDecimalsFormatNumber(min.toString(), data.decimalPlaces),
            addDecimalsFormatNumber(max.toString(), data.decimalPlaces),
            ((mid - min) * BigInt(100)) / (max - min),
          ];
        }}
      />
      <AgGridColumn
        headerName={t('Leverage')}
        field="leverage"
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
        field="averageEntryPrice"
        valueFormatter={({ data }: PositionsTableValueFormatterParams) => {
          if (!data) {
            return undefined;
          }
          const totalBalance =
            data.marginAccountBalance + data.generalAccountBalance;
          const marginAllocated = Number(
            (data.marginAccountBalance * BigInt(100)) / totalBalance
          );
          return [
            `${marginAllocated}%`,
            addDecimalsFormatNumber(
              totalBalance.toString(),
              data.decimalPlaces
            ),
            marginAllocated,
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
        valueFormatter={({ data }: PositionsTableValueFormatterParams) => {
          if (!data) {
            return undefined;
          }
          const totalBalance =
            data.marginAccountBalance + data.generalAccountBalance;
          const marginAllocated = Number(
            (data.marginAccountBalance * BigInt(100)) / totalBalance
          );
          return [
            `${marginAllocated}%`,
            addDecimalsFormatNumber(
              totalBalance.toString(),
              data.decimalPlaces
            ),
            marginAllocated,
          ];
        }}
      />
    </AgGrid>
  );
});

export default PositionsTable;
