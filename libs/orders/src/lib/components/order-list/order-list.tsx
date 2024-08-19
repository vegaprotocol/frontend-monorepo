import { memo, forwardRef, useMemo, type ForwardedRef } from 'react';
import {
  HALFMAXGOINT64,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  isNumeric,
  toBigNum,
} from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  ActionsDropdown,
  ButtonLink,
  DropdownMenuCopyItem,
  DropdownMenuItem,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  AgGrid,
  SetFilter,
  DateRangeFilter,
  negativeClassNames,
  positiveClassNames,
  MarketNameCell,
  OrderTypeCell,
  COL_DEFS,
  type TypedDataAgGrid,
  type VegaICellRendererParams,
  type VegaValueFormatterParams,
  type VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { type AgGridReact } from 'ag-grid-react';
import { type Order } from '../order-data-provider';
import { Filter } from '../order-list-manager/order-list-manager';
import { type ColDef } from 'ag-grid-community';
import { useT } from '../../use-t';

const defaultColDef = {
  resizable: true,
  sortable: true,
  filterParams: { buttons: ['reset'] },
  minWidth: 100,
};

export type OrderListTableProps = TypedDataAgGrid<Order> & {
  marketId?: string;
  onCancel: (order: Order) => void;
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
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
      {
        onCancel,
        onEdit,
        onView,
        onMarketClick,
        onOrderTypeClick,
        filter,
        ...props
      },
      ref
    ) => {
      const t = useT();
      const showAllActions = props.isReadOnly
        ? false
        : filter === undefined || filter === Filter.Open
        ? true
        : false;
      const columnDefs: ColDef[] = useMemo(
        () => [
          {
            headerName: t('Market'),
            colId: 'instrument-code',
            field: 'market.tradableInstrument.instrument.code',
            cellRenderer: 'MarketNameCell',
            cellRendererParams: { idPath: 'market.id', onMarketClick },
            pinned: true,
            width: 130,
            resizable: true,
          },
          {
            headerName: t('Filled'),
            field: 'remaining',
            cellClass: 'font-mono text-right',
            type: 'rightAligned',
            valueGetter: ({ data }: VegaValueGetterParams<Order>) => {
              if (data?.icebergOrder) {
                return data?.size && data.market
                  ? BigInt(data.size) -
                      BigInt(data.remaining) -
                      BigInt(data.icebergOrder.reservedRemaining)
                  : undefined;
              }
              return data?.size && data.market
                ? BigInt(data.size) - BigInt(data.remaining)
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
              return addDecimalsFormatNumber(
                value,
                data.market.positionDecimalPlaces ?? 0
              );
            },
          },
          {
            headerName: t('Size'),
            field: 'size',
            cellClass: 'font-mono text-right',
            type: 'rightAligned',
            cellClassRules: {
              [positiveClassNames]: ({ data }: { data: Order }) =>
                data?.side === Schema.Side.SIDE_BUY,
              [negativeClassNames]: ({ data }: { data: Order }) =>
                data?.side === Schema.Side.SIDE_SELL,
            },
            valueGetter: ({ data }: VegaValueGetterParams<Order>) => {
              return data?.size && data.market
                ? toBigNum(data.size, data.market.positionDecimalPlaces ?? 0)
                    .multipliedBy(data.side === Schema.Side.SIDE_SELL ? -1 : 1)
                    .toNumber()
                : undefined;
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Order, 'size'>) => {
              if (!data) {
                return '';
              }
              if (!data?.market || !isNumeric(data.size)) {
                return '-';
              }

              const prefix = data
                ? data.side === Schema.Side.SIDE_BUY
                  ? '+'
                  : '-'
                : '';

              if (
                data.size >= HALFMAXGOINT64 &&
                data.timeInForce ===
                  Schema.OrderTimeInForce.TIME_IN_FORCE_IOC &&
                data.reduceOnly
              ) {
                return t('MAX');
              }

              return (
                prefix +
                addDecimalsFormatNumber(
                  data.size,
                  data.market.positionDecimalPlaces
                )
              );
            },
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
              if (data?.postOnly) {
                return t('{{tifLabel}}. Post Only', { tifLabel });
              }
              if (data?.reduceOnly) {
                return t('{{tifLabel}}. Reduce only', { tifLabel });
              }

              return tifLabel;
            },
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
          },
          {
            colId: 'amend',
            ...COL_DEFS.actions,
            minWidth: showAllActions ? 80 : COL_DEFS.actions.minWidth,
            maxWidth: showAllActions ? 80 : COL_DEFS.actions.minWidth,
            cellRenderer: ({ data }: { data?: Order }) => {
              if (!data) return null;

              return (
                <div className="flex items-center justify-end gap-2">
                  {isOrderAmendable(data) && !props.isReadOnly && (
                    <>
                      {!data.icebergOrder && (
                        <ButtonLink
                          data-testid="edit"
                          onClick={() => onEdit(data)}
                          title={t('Edit order')}
                        >
                          <VegaIcon name={VegaIconNames.EDIT} size={16} />
                        </ButtonLink>
                      )}
                      <ButtonLink
                        data-testid="cancel"
                        onClick={() => onCancel(data)}
                        title={t('Cancel order')}
                      >
                        <VegaIcon name={VegaIconNames.CROSS} size={16} />
                      </ButtonLink>
                    </>
                  )}
                  <ActionsDropdown data-testid="order-actions-content">
                    <DropdownMenuCopyItem
                      value={data.id}
                      text={t('Copy order ID')}
                    />
                    <DropdownMenuItem
                      key={'view-order'}
                      data-testid="view-order"
                      onClick={() => onView(data)}
                    >
                      <VegaIcon name={VegaIconNames.INFO} size={16} />
                      {t('View order details')}
                    </DropdownMenuItem>
                  </ActionsDropdown>
                </div>
              );
            },
          },
        ],
        [
          filter,
          onCancel,
          onEdit,
          onView,
          onMarketClick,
          onOrderTypeClick,
          props.isReadOnly,
          showAllActions,
          t,
        ]
      );

      return (
        <AgGrid
          ref={ref}
          defaultColDef={defaultColDef}
          columnDefs={columnDefs}
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
