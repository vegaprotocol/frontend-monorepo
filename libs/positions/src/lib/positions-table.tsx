import classNames from 'classnames';
import { forwardRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { CellRendererSelectorResult } from 'ag-grid-community';
import type {
  VegaValueFormatterParams,
  VegaValueGetterParams,
  TypedDataAgGrid,
  VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import {
  AgGridDynamic as AgGrid,
  DateRangeFilter,
  PriceFlashCell,
  signedNumberCssClass,
  signedNumberCssClassRules,
} from '@vegaprotocol/datagrid';
import {
  volumePrefix,
  toBigNum,
  formatNumber,
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import {
  ButtonLink,
  Icon,
  Link,
  ProgressBarCell,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import { getRowId } from './use-positions-data';
import { PositionStatusMapping } from '@vegaprotocol/types';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  onMarketClick?: (id: string) => void;
  style?: CSSProperties;
  isReadOnly: boolean;
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
  return valueFormatted && notional ? (
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
  ({ onClose, onMarketClick, ...props }, ref) => {
    const [lossDialogMarket, setLossDialogMarket] = useState<{
      id: string;
      openTimestamp: string;
    } | null>(null);

    return (
      <>
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
          <AgGridColumn
            headerName={t('Market')}
            field="marketName"
            cellRenderer={({
              value,
              data,
            }: VegaICellRendererParams<Position, 'marketName'>) =>
              onMarketClick ? (
                <Link
                  onClick={() =>
                    data?.marketId && onMarketClick(data?.marketId)
                  }
                >
                  {value}
                </Link>
              ) : (
                value
              )
            }
          />
          <AgGridColumn
            headerName={t('Status')}
            field="status"
            valueFormatter={({
              value,
            }: VegaValueFormatterParams<Position, 'status'>) => {
              if (!value) return '-';
              return PositionStatusMapping[value];
            }}
          />
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
              return !data?.notional
                ? undefined
                : toBigNum(data.notional, data.marketDecimalPlaces).toNumber();
            }}
            valueFormatter={({
              data,
            }: VegaValueFormatterParams<Position, 'notional'>) => {
              return !data || !data.notional
                ? '-'
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
                : toBigNum(
                    data?.openVolume,
                    data.positionDecimalPlaces
                  ).toNumber();
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
                !data.markPrice ||
                data.marketTradingMode ===
                  Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
                ? undefined
                : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
            }}
            valueFormatter={({
              data,
            }: VegaValueFormatterParams<Position, 'markPrice'>) => {
              if (!data) {
                return undefined;
              }
              if (
                !data.markPrice ||
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
          <AgGridColumn
            headerName={t('Settlement asset')}
            field="assetSymbol"
          />
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
              if (!data || data?.liquidationPrice === undefined) {
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
              value === undefined
                ? undefined
                : formatNumber(value.toString(), 1)
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
            cellClass="font-mono text-right"
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
            headerTooltip={t(
              'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
            )}
            cellRenderer={({
              valueFormatted,
              data,
            }: VegaICellRendererParams<Position, 'realisedPNL'>) => (
              <ValueWithLossesCell
                valueFormatted={valueFormatted}
                data={data}
                onClick={setLossDialogMarket}
              />
            )}
          />
          <AgGridColumn
            headerName={t('Unrealised PNL')}
            field="unrealisedPNL"
            type="rightAligned"
            cellClassRules={signedNumberCssClassRules}
            cellClass="font-mono text-right"
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
            headerTooltip={t(
              'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
            )}
            cellRenderer={({
              valueFormatted,
              data,
            }: VegaICellRendererParams<Position, 'unrealisedPNL'>) => (
              <ValueWithLossesCell
                valueFormatted={valueFormatted}
                data={data}
                onClick={setLossDialogMarket}
              />
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
          {onClose && !props.isReadOnly ? (
            <AgGridColumn
              type="rightAligned"
              cellRenderer={({ data }: VegaICellRendererParams<Position>) =>
                data?.openVolume && data?.openVolume !== '0' ? (
                  <ButtonLink
                    data-testid="close-position"
                    onClick={() => data && onClose(data)}
                  >
                    {t('Close')}
                  </ButtonLink>
                ) : null
              }
            />
          ) : null}
        </AgGrid>
        <LossSocializationDialog
          market={lossDialogMarket}
          close={() => setLossDialogMarket(null)}
        />
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
            return !data?.notional
              ? undefined
              : toBigNum(data.notional, data.marketDecimalPlaces).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'notional'>) => {
            return !data || !data.notional
              ? '-'
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
              : toBigNum(
                  data?.openVolume,
                  data.positionDecimalPlaces
                ).toNumber();
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
              !data.markPrice ||
              data.marketTradingMode ===
                Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
              ? undefined
              : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'markPrice'>) => {
            if (!data) {
              return undefined;
            }
            if (
              !data.markPrice ||
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
            if (!data || data?.liquidationPrice === undefined) {
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
          cellClass="font-mono text-right"
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
          headerTooltip={t(
            'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
          )}
        />
        <AgGridColumn
          headerName={t('Unrealised PNL')}
          field="unrealisedPNL"
          type="rightAligned"
          cellClassRules={signedNumberCssClassRules}
          cellClass="font-mono text-right"
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
          headerTooltip={t(
            'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
          )}
        />
        <AgGridColumn
          headerName={t('Loss socialization')}
          field="lossSocializationAmount"
          type="rightAligned"
          cellClass="font-mono text-right"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'lossSocializationAmount'>) => {
            return !data
              ? undefined
              : toBigNum(
                  data.lossSocializationAmount,
                  data.decimals
                ).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'lossSocializationAmount'>) =>
            !data
              ? '-'
              : addDecimalsFormatNumber(
                  data.lossSocializationAmount,
                  data.decimals
                )
          }
        />
        <AgGridColumn
          headerName={t('Status')}
          field="status"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Position, 'status'>) => {
            if (!value) return '-';
            return PositionStatusMapping[value];
          }}
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
        {onClose && !props.isReadOnly ? (
          <AgGridColumn
            type="rightAligned"
            cellRenderer={({ data }: VegaICellRendererParams<Position>) =>
              data?.openVolume && data?.openVolume !== '0' ? (
                <ButtonLink
                  data-testid="close-position"
                  onClick={() => data && onClose(data)}
                >
                  {t('Close')}
                </ButtonLink>
              ) : null
            }
          />
        ) : null}
      </AgGrid>
    );
  }
);

export default PositionsTable;

const ValueWithLossesCell = ({
  valueFormatted,
  data,
  onClick,
}: {
  valueFormatted: string | undefined;
  data: Position | undefined;
  onClick: (args: { id: string; openTimestamp: string }) => void;
}) => {
  const lossAmount = parseInt(data?.lossSocializationAmount ?? '0');

  // TODO: re add this
  // if (lossAmount > 0) {
  return (
    <button
      className="w-full flex items-center justify-between underline"
      onClick={() => {
        if (data?.marketId && data?.marketTimestamps.open) {
          onClick({
            id: data.marketId,
            openTimestamp: data.marketTimestamps.open,
          });
        }
      }}
    >
      <span className="text-black dark:text-white mr-1">
        <Icon name="warning-sign" size={3} />
      </span>
      <span className="text-ellipsis overflow-hidden">{valueFormatted}</span>
    </button>
  );
  // }

  return <span>{valueFormatted}</span>;
};
