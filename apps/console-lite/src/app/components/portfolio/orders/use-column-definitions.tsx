import { useMemo } from 'react';
import type {
  ColDef,
  ValueFormatterParams,
  ICellRendererParams,
} from 'ag-grid-community';
import {
  addDecimal,
  getDateTimeFormat,
  negativeClassNames,
  positiveClassNames,
  t,
} from '@vegaprotocol/react-helpers';
import type {
  OrderFieldsFragment,
  Order,
  CancelOrderArgs,
} from '@vegaprotocol/orders';
import { isOrderActive } from '@vegaprotocol/orders';
import {
  OrderRejectionReasonMapping,
  OrderStatusMapping,
  OrderTypeMapping,
  Schema,
  OrderTimeInForceMapping,
} from '@vegaprotocol/types';

import BigNumber from 'bignumber.js';
import { Button } from '@vegaprotocol/ui-toolkit';

type StatusKey = keyof typeof OrderStatusMapping;
type RejectReasonKey = keyof typeof OrderRejectionReasonMapping;
type OrderTimeKey = keyof typeof OrderTimeInForceMapping;
interface Props {
  setEditOrder: (order: Order) => void;
  orderCancel: {
    cancel: (args: CancelOrderArgs) => void;
    [key: string]: unknown;
  };
}

const useColumnDefinitions = ({ setEditOrder, orderCancel }: Props) => {
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'market.tradableInstrument.instrument.code',
        headerClass: 'uppercase justify-start',
        cellClass: '!flex h-full items-center !md:pl-4',
      },
      {
        colId: 'size',
        headerName: t('Size'),
        field: 'size',
        headerClass: 'uppercase',
        cellClass: 'font-mono !flex h-full items-center',
        width: 80,
        cellClassRules: {
          [positiveClassNames]: ({ data }: { data: OrderFieldsFragment }) =>
            data?.side === Schema.Side.SIDE_BUY,
          [negativeClassNames]: ({ data }: { data: OrderFieldsFragment }) =>
            data?.side === Schema.Side.SIDE_SELL,
        },
        valueFormatter: ({ value, data }: ValueFormatterParams) => {
          if (value && data && data.market) {
            const prefix = data
              ? data.side === Schema.Side.SIDE_BUY
                ? '+'
                : '-'
              : '';
            return (
              prefix + addDecimal(value, data.market.positionDecimalPlaces)
            );
          }
          return '-';
        },
      },
      {
        colId: 'type',
        field: 'type',
        width: 80,
        valueFormatter: ({
          value,
        }: ValueFormatterParams & {
          value?: OrderFieldsFragment['type'];
        }) => OrderTypeMapping[value as Schema.OrderType],
      },
      {
        colId: 'status',
        field: 'status',
        cellClass: 'text-center font-mono !flex h-full items-center',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: StatusKey;
        }) => {
          if (value && data && data.market) {
            if (value === Schema.OrderStatus.STATUS_REJECTED) {
              return `${OrderStatusMapping[value as StatusKey]}: ${
                data.rejectionReason &&
                OrderRejectionReasonMapping[
                  data.rejectionReason as RejectReasonKey
                ]
              }`;
            }
            return OrderStatusMapping[value as StatusKey] as string;
          }
          return '-';
        },
      },
      {
        colId: 'filled',
        headerName: t('Filled'),
        headerClass: 'uppercase',
        field: 'remaining',
        cellClass: 'font-mono text-center !flex h-full items-center',
        width: 80,
        valueFormatter: ({
          data,
          value,
        }: ValueFormatterParams & {
          value?: OrderFieldsFragment['remaining'];
        }) => {
          if (value && data && data.market) {
            const dps = data.market.positionDecimalPlaces;
            const size = new BigNumber(data.size);
            const remaining = new BigNumber(value);
            const fills = size.minus(remaining);
            return `${addDecimal(fills.toString(), dps)}/${addDecimal(
              size.toString(),
              dps
            )}`;
          }
          return '-';
        },
      },
      {
        colId: 'price',
        field: 'price',
        type: 'rightAligned',
        width: 125,
        headerClass: 'uppercase text-right',
        cellClass: 'font-mono text-right !flex h-full items-center',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: OrderFieldsFragment['price'];
        }) => {
          if (
            value === undefined ||
            !data ||
            !data.market ||
            data.type === Schema.OrderType.TYPE_MARKET
          ) {
            return '-';
          }
          return addDecimal(value, data.market.decimalPlaces);
        },
      },
      {
        colId: 'timeInForce',
        field: 'timeInForce',
        minWidth: 120,
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: OrderTimeKey;
        }) => {
          if (value && data?.market) {
            if (
              value === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
              data.expiresAt
            ) {
              const expiry = getDateTimeFormat().format(
                new Date(data.expiresAt)
              );
              return `${
                OrderTimeInForceMapping[value as OrderTimeKey]
              }: ${expiry}`;
            }

            return OrderTimeInForceMapping[value as OrderTimeKey];
          }
          return '-';
        },
      },
      {
        colId: 'createdat',
        field: 'createdAt',
        valueFormatter: ({
          value,
        }: ValueFormatterParams & {
          value?: OrderFieldsFragment['createdAt'];
        }) => {
          return value ? getDateTimeFormat().format(new Date(value)) : value;
        },
      },
      {
        colId: 'updated',
        field: 'updatedAt',
        cellClass: '!flex h-full items-center justify-center',
        valueFormatter: ({
          value,
        }: ValueFormatterParams & {
          value?: OrderFieldsFragment['updatedAt'];
        }) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '-';
        },
      },
      {
        colId: 'edit',
        field: 'edit',
        width: 75,
        cellRenderer: ({ data }: ICellRendererParams) => {
          if (!data) return null;
          if (isOrderActive(data.status)) {
            return (
              <Button
                data-testid="edit"
                onClick={() => {
                  setEditOrder(data);
                }}
                size="xs"
              >
                {t('Edit')}
              </Button>
            );
          }

          return null;
        },
      },
      {
        colId: 'cancel',
        field: 'cancel',
        minWidth: 130,
        cellRenderer: ({ data }: ICellRendererParams) => {
          if (!data) return null;
          if (isOrderActive(data.status)) {
            return (
              <Button
                size="xs"
                data-testid="cancel"
                onClick={() => {
                  if (data.market) {
                    orderCancel.cancel({
                      orderId: data.id,
                      marketId: data.market.id,
                    });
                  }
                }}
              >
                Cancel
              </Button>
            );
          }

          return null;
        },
      },
    ];
  }, [orderCancel, setEditOrder]);
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
