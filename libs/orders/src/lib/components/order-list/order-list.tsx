import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  isNumeric,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import BigNumber from 'bignumber.js';
import type { ForwardedRef } from 'react';
import { memo, forwardRef } from 'react';
import {
  AgGridLazy as AgGrid,
  SetFilter,
  DateRangeFilter,
  negativeClassNames,
  positiveClassNames,
  MarketNameCell,
  OrderTypeCell,
} from '@vegaprotocol/datagrid';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import type { AgGridReact } from 'ag-grid-react';
import type { Order } from '../order-data-provider';
import { OrderActionsDropdown } from '../order-actions-dropdown/order-actions-dropdown';

export type OrderListTableProps = TypedDataAgGrid<Order> & {
  marketId?: string;
  cancel: (order: Order) => void;
  setEditOrder: (order: Order) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  readonlyStatusFilter?: boolean;
  isReadOnly: boolean;
  storeKey?: string;
};

export const OrderListTable = memo<
  OrderListTableProps & { ref?: ForwardedRef<AgGridReact> }
>(
  forwardRef<AgGridReact, OrderListTableProps>(
    (
      {
        cancel,
        setEditOrder,
        onMarketClick,
        onOrderTypeClick,
        readonlyStatusFilter,
        ...props
      },
      ref
    ) => {
      return (
        <AgGrid
          ref={ref}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filterParams: { buttons: ['reset'] },
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          getRowId={({ data }) => data.id}
          components={{ MarketNameCell, OrderTypeCell }}
          {...props}
        >
          <AgGridColumn
            headerName={t('Market')}
            field="market.tradableInstrument.instrument.code"
            cellRenderer="MarketNameCell"
            cellRendererParams={{ idPath: 'market.id', onMarketClick }}
            minWidth={150}
          />
          <AgGridColumn
            headerName={t('Size')}
            field="size"
            cellClass="font-mono text-right"
            type="rightAligned"
            cellClassRules={{
              [positiveClassNames]: ({ data }: { data: Order }) =>
                data?.side === Schema.Side.SIDE_BUY,
              [negativeClassNames]: ({ data }: { data: Order }) =>
                data?.side === Schema.Side.SIDE_SELL,
            }}
            valueFormatter={({
              value,
              data,
            }: VegaValueFormatterParams<Order, 'size'>) => {
              if (!data) {
                return undefined;
              }
              if (!data?.market || !isNumeric(value)) {
                return '-';
              }
              const prefix = data
                ? data.side === Schema.Side.SIDE_BUY
                  ? '+'
                  : '-'
                : '';
              return (
                prefix +
                addDecimalsFormatNumber(
                  value,
                  data.market.positionDecimalPlaces
                )
              );
            }}
            minWidth={80}
          />
          <AgGridColumn
            field="type"
            filter={SetFilter}
            filterParams={{
              set: Schema.OrderTypeMapping,
            }}
            cellRenderer="OrderTypeCell"
            cellRendererParams={{
              onClick: onOrderTypeClick,
            }}
            minWidth={80}
          />
          <AgGridColumn
            field="status"
            filter={SetFilter}
            filterParams={{
              set: Schema.OrderStatusMapping,
              readonly: readonlyStatusFilter,
            }}
            valueFormatter={({
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
            }}
            cellRenderer={({
              valueFormatted,
              data,
            }: {
              valueFormatted: string;
              data: Order;
            }) => (
              <span data-testid={`order-status-${data?.id}`}>
                {valueFormatted}
              </span>
            )}
            minWidth={100}
          />
          <AgGridColumn
            headerName={t('Filled')}
            field="remaining"
            cellClass="font-mono text-right"
            type="rightAligned"
            valueFormatter={({
              data,
              value,
            }: VegaValueFormatterParams<Order, 'remaining'>) => {
              if (!data) {
                return undefined;
              }
              if (!data?.market || !isNumeric(value) || !isNumeric(data.size)) {
                return '-';
              }
              const dps = data.market.positionDecimalPlaces;
              const size = new BigNumber(data.size);
              const remaining = new BigNumber(value);
              const fills = size.minus(remaining);
              return `${addDecimalsFormatNumber(
                fills.toString(),
                dps
              )}/${addDecimalsFormatNumber(size.toString(), dps)}`;
            }}
            minWidth={100}
          />
          <AgGridColumn
            field="price"
            type="rightAligned"
            cellClass="font-mono text-right"
            valueFormatter={({
              value,
              data,
            }: VegaValueFormatterParams<Order, 'price'>) => {
              if (!data) {
                return undefined;
              }
              if (
                !data?.market ||
                data.type === Schema.OrderType.TYPE_MARKET ||
                !isNumeric(value)
              ) {
                return '-';
              }
              return addDecimalsFormatNumber(value, data.market.decimalPlaces);
            }}
            minWidth={100}
          />
          <AgGridColumn
            field="timeInForce"
            filter={SetFilter}
            filterParams={{
              set: Schema.OrderTimeInForceMapping,
            }}
            valueFormatter={({
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
                return `${Schema.OrderTimeInForceMapping[value]}: ${expiry}`;
              }

              const tifLabel = value
                ? Schema.OrderTimeInForceMapping[value]
                : '';
              const label = `${tifLabel}${
                data?.postOnly ? t('. Post Only') : ''
              }${data?.reduceOnly ? t('. Reduce only') : ''}`;

              return label;
            }}
            minWidth={150}
          />
          <AgGridColumn
            field="createdAt"
            filter={DateRangeFilter}
            cellRenderer={({
              value,
            }: VegaICellRendererParams<Order, 'createdAt'>) => {
              return (
                <span data-value={value}>
                  {value ? getDateTimeFormat().format(new Date(value)) : value}
                </span>
              );
            }}
            minWidth={150}
          />
          <AgGridColumn
            field="updatedAt"
            cellRenderer={({
              data,
              value,
            }: VegaICellRendererParams<Order, 'updatedAt'>) => {
              if (!data) {
                return undefined;
              }
              return (
                <span data-value={value}>
                  {value ? getDateTimeFormat().format(new Date(value)) : '-'}
                </span>
              );
            }}
            minWidth={150}
          />
          <AgGridColumn
            colId="amend"
            headerName=""
            field="id"
            minWidth={120}
            maxWidth={120}
            type="rightAligned"
            pinned="right"
            cellRenderer={({
              data,
              value,
            }: VegaICellRendererParams<Order, 'id'>) => {
              if (!value || !data) return null;

              return (
                <div className="flex gap-2 items-center justify-end">
                  {isOrderAmendable(data) && !props.isReadOnly && (
                    <>
                      <ButtonLink
                        data-testid="edit"
                        onClick={() => setEditOrder(data)}
                      >
                        {t('Edit')}
                      </ButtonLink>
                      <ButtonLink
                        data-testid="cancel"
                        onClick={() => cancel(data)}
                      >
                        {t('Cancel')}
                      </ButtonLink>
                    </>
                  )}
                  <OrderActionsDropdown id={value} />
                </div>
              );
            }}
            sortable={false}
            flex={1}
          />
        </AgGrid>
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
  if (!order || order.peggedOrder || order.liquidityProvision) {
    return false;
  }

  if (isOrderActive(order.status)) {
    return true;
  }

  return false;
};
