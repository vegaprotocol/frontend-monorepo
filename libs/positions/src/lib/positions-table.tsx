import classNames from 'classnames';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { CellRendererSelectorResult } from 'ag-grid-community';
import type {
  VegaValueFormatterParams,
  VegaValueGetterParams,
  TypedDataAgGrid,
} from '@vegaprotocol/ui-toolkit';
import { ProgressBarCell } from '@vegaprotocol/ui-toolkit';
import {
  PriceFlashCell,
  volumePrefix,
  t,
  toBigNum,
  formatNumber,
  getDateTimeFormat,
  signedNumberCssClass,
  signedNumberCssClassRules,
  DateRangeFilter,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { ButtonLink, TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { getRowId } from './use-positions-data';
import type { VegaICellRendererParams } from '@vegaprotocol/ui-toolkit';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  style?: CSSProperties;
}

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

export const PositionsTable = forwardRef<AgGridReact, Props>(
  ({ onClose, ...props }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No positions')}
        getRowId={getRowId}
        ref={ref}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
          filter: true,
          filterParams: { buttons: ['reset'] },
          tooltipComponent: TooltipCellComponent,
        }}
        components={{ AmountCell, PriceFlashCell, ProgressBarCell }}
        {...props}
      >
        <AgGridColumn headerName={t('Market')} field="marketName" />
        <AgGridColumn
          headerName={t('Notional')}
          headerTooltip={t('Mark price x open volume.')}
          field="notional"
          type="rightAligned"
          cellClass="font-mono text-right"
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'notional'>) => {
            return data?.notional === undefined
              ? undefined
              : toBigNum(data?.notional, data.marketDecimalPlaces).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'notional'>) => {
            return !data
              ? undefined
              : addDecimalsFormatNumber(
                  data.notional,
                  data.marketDecimalPlaces
                );
          }}
        />
        <AgGridColumn
          headerName={t('Open volume')}
          field="openVolume"
          type="rightAligned"
          cellClass="font-mono text-right"
          cellClassRules={signedNumberCssClassRules}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'openVolume'>) => {
            return data?.openVolume === undefined
              ? undefined
              : toBigNum(data?.openVolume, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'openVolume'>):
            | string
            | undefined => {
            return data?.openVolume === undefined
              ? undefined
              : volumePrefix(
                  addDecimalsFormatNumber(
                    data.openVolume,
                    data.positionDecimalPlaces
                  )
                );
          }}
        />
        <AgGridColumn
          headerName={t('Mark price')}
          field="markPrice"
          type="rightAligned"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'markPrice'>) => {
            return !data ||
              data.marketTradingMode ===
                Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
              ? undefined
              : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
          }}
          valueFormatter={({
            data,
            node,
          }: VegaValueFormatterParams<Position, 'markPrice'>) => {
            if (!data) {
              return undefined;
            }
            if (
              data.marketTradingMode ===
              Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
            ) {
              return '-';
            }
            return addDecimalsFormatNumber(
              data.markPrice,
              data.marketDecimalPlaces
            );
          }}
        />
        <AgGridColumn headerName={t('Settlement asset')} field="assetSymbol" />
        <AgGridColumn
          headerName={t('Entry price')}
          field="averageEntryPrice"
          type="rightAligned"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'averageEntryPrice'>) => {
            return data?.markPrice === undefined || !data
              ? undefined
              : toBigNum(
                  data.averageEntryPrice,
                  data.marketDecimalPlaces
                ).toNumber();
          }}
          valueFormatter={({
            data,
            node,
          }: VegaValueFormatterParams<Position, 'averageEntryPrice'>):
            | string
            | undefined => {
            if (!data) {
              return undefined;
            }
            return addDecimalsFormatNumber(
              data.averageEntryPrice,
              data.marketDecimalPlaces
            );
          }}
        />
        <AgGridColumn
          headerName={t('Liquidation price (est)')}
          field="liquidationPrice"
          type="rightAligned"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'liquidationPrice'>) => {
            return data?.liquidationPrice === undefined || !data
              ? undefined
              : toBigNum(
                  data.liquidationPrice,
                  data.marketDecimalPlaces
                ).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'liquidationPrice'>):
            | string
            | undefined => {
            if (!data) {
              return undefined;
            }
            return addDecimalsFormatNumber(
              data.liquidationPrice,
              data.marketDecimalPlaces
            );
          }}
        />
        <AgGridColumn
          headerName={t('Leverage')}
          field="currentLeverage"
          type="rightAligned"
          filter="agNumberColumnFilter"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Position, 'currentLeverage'>) =>
            value === undefined ? undefined : formatNumber(value.toString(), 1)
          }
        />
        <AgGridColumn
          headerName={t('Margin allocated')}
          field="marginAccountBalance"
          type="rightAligned"
          filter="agNumberColumnFilter"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'marginAccountBalance'>) => {
            return !data
              ? undefined
              : toBigNum(data.marginAccountBalance, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
            node,
          }: VegaValueFormatterParams<Position, 'marginAccountBalance'>):
            | string
            | undefined => {
            if (!data) {
              return undefined;
            }
            return addDecimalsFormatNumber(
              data.marginAccountBalance,
              data.decimals
            );
          }}
        />
        <AgGridColumn
          headerName={t('Realised PNL')}
          field="realisedPNL"
          type="rightAligned"
          cellClassRules={signedNumberCssClassRules}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'realisedPNL'>) => {
            return !data
              ? undefined
              : toBigNum(data.realisedPNL, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'realisedPNL'>) => {
            return !data
              ? undefined
              : addDecimalsFormatNumber(data.realisedPNL, data.decimals);
          }}
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
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'unrealisedPNL'>) => {
            return !data
              ? undefined
              : toBigNum(data.unrealisedPNL, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'unrealisedPNL'>) =>
            !data
              ? undefined
              : addDecimalsFormatNumber(data.unrealisedPNL, data.decimals)
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
          filter={DateRangeFilter}
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Position, 'updatedAt'>) => {
            if (!value) {
              return value;
            }
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        {onClose ? (
          <AgGridColumn
            cellRenderer={({
              data,
              node,
            }: VegaICellRendererParams<Position>) => (
              <ButtonLink
                data-testid="close-position"
                onClick={() => data && onClose(data)}
              >
                {t('Close')}
              </ButtonLink>
            )}
          />
        ) : null}
      </AgGrid>
    );
  }
);

export default PositionsTable;
