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
import type { Orders_party_ordersConnection_edges_node } from '@vegaprotocol/orders';
import { isOrderActive, useOrderCancel } from '@vegaprotocol/orders';
import {
  OrderRejectionReasonMapping,
  OrderStatus,
  OrderType,
  OrderStatusMapping,
  OrderTypeMapping,
  Side,
  OrderTimeInForce,
  OrderTimeInForceMapping,
} from '@vegaprotocol/types';

import BigNumber from 'bignumber.js';
import { Button } from '@vegaprotocol/ui-toolkit';

type StatusKey = keyof typeof OrderStatusMapping;
type RejectReasonKey = keyof typeof OrderRejectionReasonMapping;
type OrderTimeKey = keyof typeof OrderTimeInForceMapping;

const useColumnDefinitions = () => {
  const orderCancel = useOrderCancel();
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'market.tradableInstrument.instrument.code',
      },
      {
        colId: 'size',
        headerName: t('Size'),
        field: 'size',
        cellClass: 'font-mono text-right',
        type: 'rightAligned',
        cellClassRules: {
          [positiveClassNames]: ({
            data,
          }: {
            data: Orders_party_ordersConnection_edges_node;
          }) => data?.side === Side.SIDE_BUY,
          [negativeClassNames]: ({
            data,
          }: {
            data: Orders_party_ordersConnection_edges_node;
          }) => data?.side === Side.SIDE_SELL,
        },
        valueFormatter: ({ value, data }: ValueFormatterParams) => {
          if (value && data && data.market) {
            const prefix = data
              ? data.side === Side.SIDE_BUY
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
        valueFormatter: ({
          value,
        }: ValueFormatterParams & {
          value?: Orders_party_ordersConnection_edges_node['type'];
        }) => OrderTypeMapping[value as OrderType],
      },
      {
        colId: 'status',
        field: 'status',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: StatusKey;
        }) => {
          if (value && data && data.market) {
            if (value === OrderStatus.STATUS_REJECTED) {
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
        field: 'remaining',
        cellClass: 'font-mono text-right',
        type: 'rightAligned',
        valueFormatter: ({
          data,
          value,
        }: ValueFormatterParams & {
          value?: Orders_party_ordersConnection_edges_node['remaining'];
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
        cellClass: 'font-mono text-right',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: Orders_party_ordersConnection_edges_node['price'];
        }) => {
          if (
            value === undefined ||
            !data ||
            !data.market ||
            data.type === OrderType.TYPE_MARKET
          ) {
            return '-';
          }
          return addDecimal(value, data.market.decimalPlaces);
        },
      },
      {
        colId: 'timeInForce',
        field: 'timeInForce',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: OrderTimeKey;
        }) => {
          if (value && data?.market) {
            if (
              value === OrderTimeInForce.TIME_IN_FORCE_GTT &&
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
          value?: Orders_party_ordersConnection_edges_node['createdAt'];
        }) => {
          return value ? getDateTimeFormat().format(new Date(value)) : value;
        },
      },
      {
        colId: 'updated',
        field: 'updatedAt',
        valueFormatter: ({
          value,
        }: ValueFormatterParams & {
          value?: Orders_party_ordersConnection_edges_node['updatedAt'];
        }) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '-';
        },
      },
      {
        colId: 'edit',
        field: 'edit',
        cellRenderer: ({ data }: ICellRendererParams) => {
          if (!data) return null;
          if (isOrderActive(data.status)) {
            return (
              <Button
                data-testid="edit"
                onClick={() => {
                  /*setEditOrder(data);*/
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
  }, [orderCancel]);
  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      unSortIcon: true,
    };
  }, []);
  return { columnDefs, defaultColDef };
};

export default useColumnDefinitions;
