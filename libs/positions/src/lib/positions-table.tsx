import classNames from 'classnames';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type {
  ValueFormatterParams,
  ValueGetterParams,
  ICellRendererParams,
  CellRendererSelectorResult,
} from 'ag-grid-community';
import type { ValueProps as PriceCellProps } from '@vegaprotocol/ui-toolkit';
import { EmptyCell, ProgressBarCell } from '@vegaprotocol/ui-toolkit';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  volumePrefix,
  t,
  formatNumber,
  getDateTimeFormat,
  signedNumberCssClass,
  signedNumberCssClassRules,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { Position } from './positions-data-providers';
import { MarketTradingMode } from '@vegaprotocol/types';
import { Intent, Button, TooltipCellComponent } from '@vegaprotocol/ui-toolkit';

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
  onClose?: (data: Position) => void;
  style?: CSSProperties;
}

export type PositionsTableValueFormatterParams = Omit<
  ValueFormatterParams,
  'data' | 'value'
> & {
  data: Position;
};

export interface MarketNameCellProps {
  valueFormatted?: [string, string];
}

export const MarketNameCell = ({ valueFormatted }: MarketNameCellProps) => {
  if (valueFormatted && valueFormatted[1]) {
    return (
      <div className="leading-tight">
        <div>{valueFormatted[0]}</div>
        <div>{valueFormatted[1]}</div>
      </div>
    );
  }
  return (valueFormatted && valueFormatted[0]) || undefined;
};

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
  return valueFormatted ? (
    <div className="leading-tight font-mono">
      <div
        className={classNames('text-right', signedNumberCssClass(openVolume))}
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

const ButtonCell = ({
  onClick,
  data,
}: {
  onClick: (position: Position) => void;
  data: Position;
}) => {
  return (
    <Button
      data-testid="close-position"
      onClick={() => onClick(data)}
      size="xs"
    >
      {t('Close')}
    </Button>
  );
};

const progressBarValueFormatter = ({
  data,
  node,
}: PositionsTableValueFormatterParams):
  | PriceCellProps['valueFormatted']
  | undefined => {
  if (!data || node?.rowPinned) {
    return undefined;
  }
  const min = BigInt(data.averageEntryPrice);
  const max = BigInt(data.liquidationPrice);
  const mid = BigInt(data.markPrice);
  const range = max - min;
  return {
    low: addDecimalsFormatNumber(min.toString(), data.marketDecimalPlaces),
    high: addDecimalsFormatNumber(max.toString(), data.marketDecimalPlaces),
    value: range ? Number(((mid - min) * BigInt(100)) / range) : 0,
    intent: data.lowMarginLevel ? Intent.Warning : undefined,
  };
};

export const PositionsTable = forwardRef<AgGridReact, Props>(
  ({ onClose, ...props }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No positions')}
        getRowId={getRowId}
        rowHeight={34}
        ref={ref}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          tooltipComponent: TooltipCellComponent,
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
            // split market name into two parts, 'Part1 (Part2)' or 'Part1 - Part2'
            const matches = value.match(/^(.*)(\((.*)\)| - (.*))\s*$/);
            if (matches && matches[1] && matches[3]) {
              return [matches[1].trim(), matches[3].trim()];
            }
            return [value];
          }}
        />
        <AgGridColumn
          headerName={t('Size')}
          field="openVolume"
          valueGetter={({ node, data }: ValueGetterParams) => {
            return node?.rowPinned ? data?.notional : data?.openVolume;
          }}
          type="rightAligned"
          cellRendererSelector={(
            params: ICellRendererParams
          ): CellRendererSelectorResult => {
            return {
              component: params.node.rowPinned ? PriceFlashCell : AmountCell,
            };
          }}
          valueFormatter={({
            value,
            data,
            node,
          }: PositionsTableValueFormatterParams & {
            value: Position['openVolume'];
          }): AmountCellProps['valueFormatted'] | string => {
            if (!value || !data) {
              return undefined;
            }
            if (node?.rowPinned) {
              return addDecimalsFormatNumber(value, data.decimals);
            }
            return data;
          }}
        />
        <AgGridColumn
          headerName={t('Mark price')}
          field="markPrice"
          type="rightAligned"
          cellRendererSelector={(
            params: ICellRendererParams
          ): CellRendererSelectorResult => {
            return {
              component: params.node.rowPinned ? EmptyCell : PriceFlashCell,
            };
          }}
          valueFormatter={({
            value,
            data,
            node,
          }: PositionsTableValueFormatterParams & {
            value: Position['markPrice'];
          }) => {
            if (!data || !value || node?.rowPinned) {
              return undefined;
            }
            if (
              data.marketTradingMode ===
              MarketTradingMode.TRADING_MODE_OPENING_AUCTION
            ) {
              return '-';
            }
            return addDecimalsFormatNumber(
              value.toString(),
              data.marketDecimalPlaces
            );
          }}
        />
        <AgGridColumn
          headerName={t('Entry price')}
          field="averageEntryPrice"
          headerComponentParams={{
            template:
              '<div class="ag-cell-label-container" role="presentation">' +
              `  <span>${t('Liquidation price (est)')}</span>` +
              '  <span ref="eText" class="ag-header-cell-text"></span>' +
              '</div>',
          }}
          flex={2}
          headerTooltip={t(
            'Liquidation prices are based on the amount of collateral you have available, the risk of your position and the liquidity on the order book. They can change rapidly based on the profit and loss of your positions and any changes to collateral from opening/closing other positions and making deposits/withdrawals.'
          )}
          cellRendererSelector={(
            params: ICellRendererParams
          ): CellRendererSelectorResult => {
            return {
              component: params.node.rowPinned ? EmptyCell : ProgressBarCell,
            };
          }}
          valueFormatter={progressBarValueFormatter}
        />
        <AgGridColumn
          headerName={t('Leverage')}
          field="currentLeverage"
          type="rightAligned"
          cellRendererSelector={(
            params: ICellRendererParams
          ): CellRendererSelectorResult => {
            return {
              component: params.node.rowPinned ? EmptyCell : PriceFlashCell,
            };
          }}
          valueFormatter={({
            value,
            node,
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
          cellRendererSelector={(
            params: ICellRendererParams
          ): CellRendererSelectorResult => {
            return {
              component: params.node.rowPinned ? EmptyCell : ProgressBarCell,
            };
          }}
          valueFormatter={({
            data,
            value,
            node,
          }: PositionsTableValueFormatterParams & {
            value: Position['capitalUtilisation'];
          }): PriceCellProps['valueFormatted'] | undefined => {
            if (!data || node?.rowPinned) {
              return undefined;
            }
            return {
              low: `${formatNumber(value, 2)}%`,
              high: addDecimalsFormatNumber(data.totalBalance, data.decimals),
              value: Number(value),
            };
          }}
        />
        <AgGridColumn
          headerName={t('Realised PNL')}
          field="realisedPNL"
          type="rightAligned"
          cellClassRules={signedNumberCssClassRules}
          valueFormatter={({
            value,
            data,
          }: PositionsTableValueFormatterParams & {
            value: Position['realisedPNL'];
          }) =>
            value === undefined
              ? undefined
              : addDecimalsFormatNumber(value.toString(), data.decimals)
          }
          cellRenderer="PriceFlashCell"
          headerTooltip={t(
            'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
          )}
        />
        <AgGridColumn
          headerName={t('Unrealised PNL')}
          field="unrealisedPNL"
          type="rightAligned"
          cellClassRules={signedNumberCssClassRules}
          valueFormatter={({
            value,
            data,
          }: PositionsTableValueFormatterParams & {
            value: Position['unrealisedPNL'];
          }) =>
            value === undefined
              ? undefined
              : addDecimalsFormatNumber(value.toString(), data.decimals)
          }
          cellRenderer="PriceFlashCell"
          headerTooltip={t(
            'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
          )}
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
        {onClose ? (
          <AgGridColumn
            cellRendererSelector={(
              params: ICellRendererParams
            ): CellRendererSelectorResult => {
              return {
                component: params.node.rowPinned ? EmptyCell : ButtonCell,
              };
            }}
            cellRendererParams={{ onClick: onClose }}
          />
        ) : null}
      </AgGrid>
    );
  }
);

export default PositionsTable;
