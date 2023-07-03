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
  OrderTypeCell,
  COL_DEFS,
} from '@vegaprotocol/datagrid';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import type { AgGridReact } from 'ag-grid-react';
import type { Order } from '../order-data-provider';
import { OrderActionsDropdown } from '../order-actions-dropdown';
import { Filter } from '../order-list-manager';
import type { ColDef } from 'ag-grid-community';

export type OrderListTableProps = TypedDataAgGrid<Order> & {
  marketId?: string;
  onCancel: (order: Order) => void;
  onEdit: (order: Order) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  filter?: Filter;
  isReadOnly: boolean;
};

export const OrderListTable = memo<
  OrderListTableProps & { ref?: ForwardedRef<AgGridReact> }
>(
  forwardRef<AgGridReact, OrderListTableProps>(
    (
      { onCancel, onEdit, onMarketClick, onOrderTypeClick, filter, ...props },
      ref
    ) => {
      const showAllActions = props.isReadOnly
        ? false
        : filter === undefined || filter === Filter.Open
        ? true
        : false;
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
            headerName: t('Size'),
            field: 'remaining',
            cellClass: 'font-mono text-right',
            cellClassRules: {
              [positiveClassNames]: ({ data }: { data: Order }) =>
                data?.side === Schema.Side.SIDE_BUY,
              [negativeClassNames]: ({ data }: { data: Order }) =>
                data?.side === Schema.Side.SIDE_SELL,
            },
            type: 'rightAligned',
            valueGetter: ({ data }: VegaValueGetterParams<Order>) => {
              return data?.size && data.market
                ? toBigNum(
                    (BigInt(data.size) - BigInt(data.remaining)).toString(),
                    data.market.positionDecimalPlaces ?? 0
                  ).toNumber()
                : undefined;
            },
            valueFormatter: ({
              data,
              value,
            }: VegaValueFormatterParams<Order, 'remaining'>): string => {
              if (!data) {
                return '';
              }
              if (!data?.market || !isNumeric(value) || !isNumeric(data.size)) {
                return '-';
              }
              const prefix = data
                ? data.side === Schema.Side.SIDE_BUY
                  ? '+'
                  : '-'
                : '';
              const { positionDecimalPlaces } = data.market;
              const filled = BigInt(data.size) - BigInt(data.remaining);
              return `${prefix}${addDecimalsFormatNumber(
                filled.toString(),
                positionDecimalPlaces
              )}/${addDecimalsFormatNumber(data.size, positionDecimalPlaces)}`;
            },
            minWidth: 100,
          },
          {
            field: 'type',
            filter: SetFilter,
            filterParams: {
              set: Schema.OrderTypeMapping,
            },
            cellRenderer: 'OrderTypeCell',
            cellRendererParams: {
              onClick: onOrderTypeClick,
            },
            minWidth: 80,
          },
          {
            field: 'status',
            filter: SetFilter,
            filterParams: {
              set: Schema.OrderStatusMapping,
              readonly: filter !== undefined,
            },
            valueFormatter: ({
              value,
              data,
            }: VegaValueFormatterParams<Order, 'status'>) => {
              if (data?.rejectionReason && value) {
                return `${Schema.OrderStatusMapping[value]}: ${
                  (data?.rejectionReason &&
                    Schema.OrderRejectionReasonMapping[data.rejectionReason]) ||
                  data?.rejectionReason
                }`;
              }
              return value ? Schema.OrderStatusMapping[value] : '';
            },
            cellRenderer: ({
              valueFormatted,
              data,
            }: {
              valueFormatted: string;
              data: Order;
            }) => (
              <span data-testid={`order-status-${data?.id}`}>
                {valueFormatted}
              </span>
            ),
            minWidth: 100,
          },
          {
            field: 'price',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            valueFormatter: ({
              value,
              data,
            }: VegaValueFormatterParams<Order, 'price'>) => {
              if (!data) {
                return '';
              }
              if (
                !data?.market ||
                data.type === Schema.OrderType.TYPE_MARKET ||
                !isNumeric(value)
              ) {
                return '-';
              }
              return addDecimalsFormatNumber(value, data.market.decimalPlaces);
            },
            minWidth: 100,
          },
          {
            field: 'timeInForce',
            filter: SetFilter,
            filterParams: {
              set: Schema.OrderTimeInForceMapping,
            },
            valueFormatter: ({
              value,
              data,
            }: VegaValueFormatterParams<Order, 'timeInForce'>) => {
              if (
                value === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
                data?.expiresAt
              ) {
                const expiry = getDateTimeFormat().format(
                  new Date(data.expiresAt)
                );
                return `${Schema.OrderTimeInForceCode[value]}: ${expiry}`;
              }

              const tifLabel = value ? Schema.OrderTimeInForceCode[value] : '';
              const label = `${tifLabel}${
                data?.postOnly ? t('. Post Only') : ''
              }${data?.reduceOnly ? t('. Reduce only') : ''}`;

              return label;
            },
            minWidth: 150,
          },
          {
            field: 'updatedAt',
            filter: DateRangeFilter,
            valueGetter: ({ data }: VegaValueGetterParams<Order>) =>
              data?.updatedAt || data?.createdAt,
            cellRenderer: ({
              data,
            }: VegaICellRendererParams<Order, 'updatedAt'>) => {
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
            colId: 'amend',
            ...COL_DEFS.actions,
            minWidth: showAllActions ? 120 : COL_DEFS.actions.minWidth,
            maxWidth: showAllActions ? 120 : COL_DEFS.actions.minWidth,
            cellRenderer: ({ data }: { data?: Order }) => {
              if (!data) return null;

              return (
                <div className="flex gap-2 items-center justify-end">
                  {isOrderAmendable(data) && !props.isReadOnly && (
                    <>
                      <ButtonLink
                        data-testid="edit"
                        onClick={() => onEdit(data)}
                      >
                        {t('Edit')}
                      </ButtonLink>
                      <ButtonLink
                        data-testid="cancel"
                        onClick={() => onCancel(data)}
                      >
                        {t('Cancel')}
                      </ButtonLink>
                    </>
                  )}
                  <OrderActionsDropdown id={data?.id} />
                </div>
              );
            },
          },
        ],
        [
          filter,
          onCancel,
          onEdit,
          onMarketClick,
          onOrderTypeClick,
          props.isReadOnly,
          showAllActions,
        ]
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
          components={{ MarketNameCell, OrderTypeCell }}
          {...props}
        />
      );
    }
  )
);

/**
 * Check if an order is active to determine if it can be edited or cancelled
 */
export const isOrderActive = (status: Schema.OrderStatus) => {
  return ![
    Schema.OrderStatus.STATUS_CANCELLED,
    Schema.OrderStatus.STATUS_REJECTED,
    Schema.OrderStatus.STATUS_EXPIRED,
    Schema.OrderStatus.STATUS_FILLED,
    Schema.OrderStatus.STATUS_STOPPED,
    Schema.OrderStatus.STATUS_PARTIALLY_FILLED,
  ].includes(status);
};

export const isOrderAmendable = (order: Order | undefined) => {
  if (!order || order.liquidityProvision) {
    return false;
  }

  if (isOrderActive(order.status)) {
    return true;
  }

  return false;
};
