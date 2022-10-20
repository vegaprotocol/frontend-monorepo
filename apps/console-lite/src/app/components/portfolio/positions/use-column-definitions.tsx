import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  PriceFlashCell,
  signedNumberCssClassRules,
  t,
} from '@vegaprotocol/react-helpers';
import type { Position } from '@vegaprotocol/positions';
import { AmountCell } from '@vegaprotocol/positions';
import type {
  CellRendererSelectorResult,
  ICellRendererParams,
  ValueGetterParams,
  GroupCellRendererParams,
  ColDef,
} from 'ag-grid-community';
import { MarketTradingMode } from '@vegaprotocol/types';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';
import { Intent, ProgressBarCell } from '@vegaprotocol/ui-toolkit';

const EmptyCell = () => '';

const useColumnDefinitions = () => {
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Market'),
        headerClass: 'uppercase justify-start',
        cellClass: '!flex h-full items-center !md:pl-4',
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
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center',
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
        }: VegaValueFormatterParams<Position, 'openVolume'>) => {
          let ret;
          if (value && data) {
            ret = node?.rowPinned
              ? addDecimalsFormatNumber(value, data.decimals)
              : data;
          }
          // FIXME this column needs refactoring
          return ret as unknown as string;
        },
      },
      {
        colId: 'markprice',
        headerName: t('Mark price'),
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center justify-center',
        field: 'markPrice',
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
        }: VegaValueFormatterParams<Position, 'markPrice'>) => {
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
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center',
        field: 'averageEntryPrice',
        headerComponentParams: {
          template:
            '<div class="ag-cell-label-container" role="presentation">' +
            `  <span>${t('Liquidation price (est)')}</span>` +
            '  <span ref="eText" class="ag-header-cell-text"></span>' +
            '</div>',
        },
        cellRenderer: ({ node, data }: GroupCellRendererParams) => {
          const valueFormatted =
            data && !node?.rowPinned
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
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center justify-center',
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
        }: VegaValueFormatterParams<Position, 'currentLeverage'>) =>
          value === undefined ? '' : formatNumber(value.toString(), 1),
      },
      {
        colId: 'marginallocated',
        headerName: t('Margin allocated'),
        headerClass: 'uppercase',
        cellClass: '!flex h-full flex-col justify-center',
        field: 'capitalUtilisation',
        type: 'rightAligned',
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
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center',
        field: 'realisedPNL',
        type: 'rightAligned',
        cellClassRules: signedNumberCssClassRules,
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Position, 'realisedPNL'>) =>
          value === undefined || data === undefined
            ? ''
            : addDecimalsFormatNumber(value.toString(), data.decimals),
        cellRenderer: 'PriceFlashCell',
        headerTooltip: t('P&L excludes any fees paid.'),
      },
      {
        colId: 'unrealisedpnl',
        headerName: t('Unrealised PNL'),
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center',
        field: 'unrealisedPNL',
        type: 'rightAligned',
        cellClassRules: signedNumberCssClassRules,
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Position, 'unrealisedPNL'>) =>
          value === undefined || data === undefined
            ? ''
            : addDecimalsFormatNumber(value.toString(), data.decimals),
        cellRenderer: 'PriceFlashCell',
      },
      {
        colId: 'updated',
        headerName: t('Updated'),
        headerClass: 'uppercase',
        cellClass: '!flex h-full items-center',
        field: 'updatedAt',
        type: 'rightAligned',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<Position, 'updatedAt'>) => {
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
      headerClass: 'uppercase',
      cellClass: '!flex h-full items-center',
    };
  }, []);
  return { columnDefs, defaultColDef };
};

export default useColumnDefinitions;
