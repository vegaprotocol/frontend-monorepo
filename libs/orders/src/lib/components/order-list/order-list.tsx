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
import { memo, forwardRef } from 'react';
import {
  AgGridDynamic as AgGrid,
  SetFilter,
  DateRangeFilter,
  negativeClassNames,
  positiveClassNames,
  MarketNameCell,
} from '@vegaprotocol/datagrid';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import type { AgGridReact } from 'ag-grid-react';
import type { Order } from '../order-data-provider';

type OrderListProps = TypedDataAgGrid<Order> & { marketId?: string };

export type OrderListTableProps = OrderListProps & {
  cancel: (order: Order) => void;
  setEditOrder: (order: Order) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
};

export const OrderListTable = memo(
  forwardRef<AgGridReact, OrderListTableProps>(
    ({ cancel, setEditOrder, onMarketClick, ...props }, ref) => {
      return (
        <AgGrid
          ref={ref}
          defaultColDef={{
            flex: 1,
            resizable: true,
            sortable: true,
            filterParams: { buttons: ['reset'] },
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          getRowId={({ data }) => data.id}
          components={{ MarketNameCell }}
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
            valueFormatter={({
              data: order,
              value,
            }: VegaValueFormatterParams<Order, 'type'>) => {
              if (!order) {
                return undefined;
              }
              if (!value) return '-';
              if (order?.peggedOrder) return t('Pegged');
              if (order?.liquidityProvision) return t('Liquidity provision');
              return Schema.OrderTypeMapping[value];
            }}
            minWidth={80}
          />
          <AgGridColumn
            field="status"
            filter={SetFilter}
            filterParams={{
              set: Schema.OrderStatusMapping,
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
              node,
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
              node,
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
            cellRenderer={({
              data,
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
            filter={DateRangeFilter}
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
            field="status"
            minWidth={100}
            type="rightAligned"
            cellRenderer={({ data, node }: VegaICellRendererParams<Order>) => {
              return data && isOrderAmendable(data) && !props.isReadOnly ? (
                <>
                  <ButtonLink
                    data-testid="edit"
                    onClick={() => setEditOrder(data)}
                  >
                    {t('Edit')}
                  </ButtonLink>
                  <span className="mx-1" />
                  <ButtonLink data-testid="cancel" onClick={() => cancel(data)}>
                    {t('Cancel')}
                  </ButtonLink>
                </>
              ) : null;
            }}
            sortable={false}
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
