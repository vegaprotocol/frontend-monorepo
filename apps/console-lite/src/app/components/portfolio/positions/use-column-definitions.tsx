import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  PriceFlashCell,
  signedNumberCssClassRules,
  t,
} from '@vegaprotocol/react-helpers';
import type {
  PositionsTableValueFormatterParams,
  Position,
} from '@vegaprotocol/positions';
import { AmountCell, ProgressBarCell } from '@vegaprotocol/positions';
import type {
  CellRendererSelectorResult,
  ICellRendererParams,
  ValueGetterParams,
  GroupCellRendererParams,
  ColDef,
} from 'ag-grid-community';
import { MarketTradingMode } from '@vegaprotocol/types';
import { Intent } from '@vegaprotocol/ui-toolkit';

const EmptyCell = () => '';

const useColumnDefinitions = () => {
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'marketName',
        cellRenderer: ({ value }: GroupCellRendererParams) => {
          if (!value) {
            return null;
          }
          const valueFormatted: [string, string?] = (() => {
            // split market name into two parts, 'Part1 (Part2)' or 'Part1 - Part2'
            const matches = value.match(/^(.*)(\((.*)\)| - (.*))\s*$/);
            if (matches && matches[1] && matches[3]) {
              return [matches[1].trim(), matches[3].trim()];
            }
            return [value];
          })();
          if (valueFormatted && valueFormatted[1]) {
            return (
              <div className="leading-tight">
                <div>{valueFormatted[0]}</div>
                <div>{valueFormatted[1]}</div>
              </div>
            );
          }
          return valueFormatted ? valueFormatted[0] : null;
        },
      },
      {
        colId: 'amount',
        headerName: t('Amount'),
        field: 'openVolume',
        valueGetter: ({ node, data }: ValueGetterParams) => {
          return node?.rowPinned ? data?.notional : data?.openVolume;
        },
        type: 'rightAligned',
        cellRendererSelector: (
          params: ICellRendererParams
        ): CellRendererSelectorResult => {
          return {
            component: params.node.rowPinned ? PriceFlashCell : AmountCell,
          };
        },
        valueFormatter: ({
          value,
          data,
          node,
        }: PositionsTableValueFormatterParams & {
          value: Position['openVolume'];
        }) => {
          if (value && data && node?.rowPinned) {
            return addDecimalsFormatNumber(value, data.decimals);
          }
          return '-';
        },
      },
      {
        colId: 'markprice',
        headerName: t('Mark price'),
        field: 'markPrice',
        type: 'rightAligned',
        cellRendererSelector: (
          params: ICellRendererParams
        ): CellRendererSelectorResult => {
          return {
            component: params.node.rowPinned ? EmptyCell : PriceFlashCell,
          };
        },
        valueFormatter: ({
          value,
          data,
          node,
        }: PositionsTableValueFormatterParams & {
          value: Position['markPrice'];
        }) => {
          if (
            data &&
            value &&
            node?.rowPinned &&
            data.marketTradingMode ===
              MarketTradingMode.TRADING_MODE_OPENING_AUCTION
          ) {
            return addDecimalsFormatNumber(
              value.toString(),
              data.marketDecimalPlaces
            );
          }
          return '-';
        },
      },
      {
        colId: 'entryprice',
        headerName: t('Entry price'),
        field: 'averageEntryPrice',
        headerComponentParams: {
          template:
            '<div class="ag-cell-label-container" role="presentation">' +
            `  <span>${t('Liquidation price (est)')}</span>` +
            '  <span ref="eText" class="ag-header-cell-text"></span>' +
            '</div>',
        },
        flex: 2,
        cellRenderer: ({ node, data }: GroupCellRendererParams) => {
          const valueFormatted = data
            ? (() => {
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
                  value: range
                    ? Number(((mid - min) * BigInt(100)) / range)
                    : 0,
                  intent: data.lowMarginLevel ? Intent.Warning : undefined,
                };
              })()
            : undefined;
          return node.rowPinned ? (
            ''
          ) : (
            <ProgressBarCell valueFormatted={valueFormatted} />
          );
        },
      },
      {
        colId: 'leverage',
        headerName: t('Leverage'),
        field: 'currentLeverage',
        type: 'rightAligned',
        cellRendererSelector: (
          params: ICellRendererParams
        ): CellRendererSelectorResult => {
          return {
            component: params.node.rowPinned ? EmptyCell : PriceFlashCell,
          };
        },
        valueFormatter: ({
          value,
          node,
        }: PositionsTableValueFormatterParams & {
          value: Position['currentLeverage'];
        }) => (value === undefined ? '' : formatNumber(value.toString(), 1)),
      },
      {
        colId: 'marginallocated',
        headerName: t('Margin allocated'),
        field: 'capitalUtilisation',
        type: 'rightAligned',
        flex: 2,
        cellRenderer: ({ value, node, data }: GroupCellRendererParams) => {
          const valueFormatted =
            data && value
              ? (() => {
                  return {
                    low: `${formatNumber(value, 2)}%`,
                    high: addDecimalsFormatNumber(
                      data.totalBalance,
                      data.decimals
                    ),
                    value: Number(value),
                  };
                })()
              : undefined;
          return node.rowPinned ? (
            ''
          ) : (
            <ProgressBarCell valueFormatted={valueFormatted} />
          );
        },
      },
      {
        colId: 'realisedpnl',
        headerName: t('Realised PNL'),
        field: 'realisedPNL',
        type: 'rightAligned',
        cellClassRules: signedNumberCssClassRules,
        valueFormatter: ({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['realisedPNL'];
        }) =>
          value === undefined
            ? ''
            : addDecimalsFormatNumber(value.toString(), data.decimals),
        cellRenderer: 'PriceFlashCell',
        headerTooltip: t('P&L excludes any fees paid.'),
      },
      {
        colId: 'unrealisedpnl',
        headerName: t('Unrealised PNL'),
        field: 'unrealisedPNL',
        type: 'rightAligned',
        cellClassRules: signedNumberCssClassRules,
        valueFormatter: ({
          value,
          data,
        }: PositionsTableValueFormatterParams & {
          value: Position['unrealisedPNL'];
        }) =>
          value === undefined
            ? ''
            : addDecimalsFormatNumber(value.toString(), data.decimals),
        cellRenderer: 'PriceFlashCell',
      },
      {
        colId: 'updated',
        headerName: t('Updated'),
        field: 'updatedAt',
        type: 'rightAligned',
        valueFormatter: ({
          value,
        }: PositionsTableValueFormatterParams & {
          value: Position['updatedAt'];
        }) => {
          if (!value) {
            return '';
          }
          return getDateTimeFormat().format(new Date(value));
        },
      },
    ];
  }, []);
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      unSortIcon: true,
    };
  }, []);
  return { columnDefs, defaultColDef };
};

export default useColumnDefinitions;
