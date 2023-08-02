import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  isNumeric,
  toBigNum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import type { ForwardedRef } from 'react';
import { memo, forwardRef, useMemo } from 'react';
import {
  AgGridLazy as AgGrid,
  SetFilter,
  DateRangeFilter,
  negativeClassNames,
  positiveClassNames,
  MarketNameCell,
  COL_DEFS,
} from '@vegaprotocol/datagrid';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import type { AgGridReact } from 'ag-grid-react';
import type { StopOrder } from '../order-data-provider/stop-orders-data-provider';
import type { ColDef } from 'ag-grid-community';

export type StopOrdersTableProps = TypedDataAgGrid<StopOrder> & {
  onCancel: (order: StopOrder) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
};

export const StopOrdersTable = memo<
  StopOrdersTableProps & { ref?: ForwardedRef<AgGridReact> }
>(
  forwardRef<AgGridReact, StopOrdersTableProps>(
    ({ onCancel, onMarketClick, ...props }, ref) => {
      const showAllActions = !props.isReadOnly;
      const columnDefs: ColDef[] = useMemo(
        () => [
          {
            headerName: t('Market'),
            field: 'market.tradableInstrument.instrument.code',
            cellRenderer: 'MarketNameCell',
            cellRendererParams: { idPath: 'market.id', onMarketClick },
            minWidth: 150,
          },
          {
            headerName: t('Trigger'),
            field: 'trigger',
            cellClass: 'font-mono text-right',
            type: 'rightAligned',
            sortable: false,
            valueFormatter: ({
              data,
              value,
            }: VegaValueFormatterParams<StopOrder, 'trigger'>): string => {
              if (data && value?.__typename === 'StopOrderPrice') {
                return `${t('Mark')} ${
                  data?.triggerDirection ===
                  Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
                    ? '<'
                    : '>'
                } ${addDecimalsFormatNumber(
                  value.price,
                  data.market.decimalPlaces
                )}`;
              }
              if (
                data &&
                value?.__typename === 'StopOrderTrailingPercentOffset'
              ) {
                return `${t('Mark')} ${
                  data?.triggerDirection ===
                  Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
                    ? '+'
                    : '-'
                }${(Number(value.trailingPercentOffset) * 100).toFixed(1)}%`;
              }
              return '-';
            },
            minWidth: 100,
          },
          {
            field: 'expiresAt',
            valueFormatter: ({
              value,
              data,
            }: VegaValueFormatterParams<StopOrder, 'expiresAt'>) => {
              if (
                data &&
                value &&
                data?.expiryStrategy !==
                  Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED
              ) {
                const expiresAt = getDateTimeFormat().format(new Date(value));
                const expiryStrategy =
                  data.expiryStrategy ===
                  Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT
                    ? t('Submit')
                    : t('Cancels');
                return `${expiryStrategy} ${expiresAt}`;
              }
              return '';
            },
            minWidth: 150,
          },
          {
            headerName: t('Size'),
            field: 'submission.size',
            cellClass: 'font-mono text-right',
            type: 'rightAligned',
            cellClassRules: {
              [positiveClassNames]: ({ data }: { data: StopOrder }) =>
                data?.submission.size === Schema.Side.SIDE_BUY,
              [negativeClassNames]: ({ data }: { data: StopOrder }) =>
                data?.submission.size === Schema.Side.SIDE_SELL,
            },
            valueGetter: ({ data }: VegaValueGetterParams<StopOrder>) => {
              return data?.submission.size && data.market
                ? toBigNum(
                    data.submission.size,
                    data.market.positionDecimalPlaces ?? 0
                  )
                    .multipliedBy(
                      data.submission.side === Schema.Side.SIDE_SELL ? -1 : 1
                    )
                    .toNumber()
                : undefined;
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<StopOrder, 'size'>) => {
              if (!data) {
                return '';
              }
              if (!data?.market || !isNumeric(data.submission.size)) {
                return '-';
              }
              const prefix = data
                ? data.submission.side === Schema.Side.SIDE_BUY
                  ? '+'
                  : '-'
                : '';
              return (
                prefix +
                addDecimalsFormatNumber(
                  data.submission.size,
                  data.market.positionDecimalPlaces
                )
              );
            },
            minWidth: 80,
          },
          {
            field: 'submission.type',
            filter: SetFilter,
            filterParams: {
              set: Schema.OrderTypeMapping,
            },
            cellRenderer: ({
              value,
            }: VegaICellRendererParams<StopOrder, 'submission.type'>) =>
              value ? Schema.OrderTypeMapping[value] : '',
            minWidth: 80,
          },
          {
            field: 'status',
            filter: SetFilter,
            filterParams: {
              set: Schema.StopOrderStatusMapping,
            },
            valueFormatter: ({
              value,
            }: VegaValueFormatterParams<StopOrder, 'status'>) => {
              return value ? Schema.StopOrderStatusMapping[value] : '';
            },
            cellRenderer: ({
              valueFormatted,
              data,
            }: {
              valueFormatted: string;
              data: StopOrder;
            }) => (
              <span data-testid={`order-status-${data?.id}`}>
                {valueFormatted}
              </span>
            ),
            minWidth: 100,
          },
          {
            field: 'submission.price',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            valueFormatter: ({
              value,
              data,
            }: VegaValueFormatterParams<StopOrder, 'submission.price'>) => {
              if (!data) {
                return '';
              }
              if (
                !data?.market ||
                data.submission.type === Schema.OrderType.TYPE_MARKET ||
                !isNumeric(value)
              ) {
                return '-';
              }
              return addDecimalsFormatNumber(value, data.market.decimalPlaces);
            },
            minWidth: 100,
          },
          {
            field: 'submission.timeInForce',
            filter: SetFilter,
            filterParams: {
              set: Schema.OrderTimeInForceMapping,
            },
            valueFormatter: ({
              value,
            }: VegaValueFormatterParams<
              StopOrder,
              'submission.timeInForce'
            >) => {
              return value ? Schema.OrderTimeInForceCode[value] : '';
            },
            minWidth: 150,
          },
          {
            field: 'updatedAt',
            filter: DateRangeFilter,
            valueGetter: ({ data }: VegaValueGetterParams<StopOrder>) =>
              data?.updatedAt || data?.createdAt,
            cellRenderer: ({
              data,
            }: VegaICellRendererParams<StopOrder, 'createdAt'>) => {
              if (!data) {
                return undefined;
              }
              const value = data.updatedAt || data.createdAt;
              return (
                <span data-value={value}>
                  {value ? getDateTimeFormat().format(new Date(value)) : '-'}
                </span>
              );
            },
            minWidth: 150,
          },
          {
            colId: 'actions',
            ...COL_DEFS.actions,
            minWidth: showAllActions ? 120 : COL_DEFS.actions.minWidth,
            maxWidth: showAllActions ? 120 : COL_DEFS.actions.minWidth,
            cellRenderer: ({ data }: { data?: StopOrder }) => {
              if (!data) return null;

              return (
                <div className="flex gap-2 items-center justify-end">
                  {data.status === Schema.StopOrderStatus.STATUS_PENDING &&
                    !props.isReadOnly && (
                      <ButtonLink
                        data-testid="cancel"
                        onClick={() => onCancel(data)}
                      >
                        {t('Cancel')}
                      </ButtonLink>
                    )}
                </div>
              );
            },
          },
        ],
        [onCancel, onMarketClick, props.isReadOnly, showAllActions]
      );

      return (
        <AgGrid
          ref={ref}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filterParams: { buttons: ['reset'] },
          }}
          columnDefs={columnDefs}
          style={{
            width: '100%',
            height: '100%',
          }}
          getRowId={({ data }) => data.id}
          components={{ MarketNameCell }}
          {...props}
        />
      );
    }
  )
);
