import { useMemo } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type {
  FillFields,
  Fills_party_tradesConnection_edges_node,
} from '@vegaprotocol/fills';
import classNames from 'classnames';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  negativeClassNames,
  positiveClassNames,
  t,
} from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import { Side } from '@vegaprotocol/types';
import type { FillFields_market_tradableInstrument_instrument_product } from '@vegaprotocol/fills';

interface Props {
  partyId: string;
}

const useColumnDefinitions = ({ partyId }: Props) => {
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'market.tradableInstrument.instrument.name',
      },
      {
        colId: 'size',
        headerName: t('Size'),
        type: 'rightAligned',
        field: 'size',
        cellClass: ({ data }: { data: FillFields }) => {
          return classNames('text-right', {
            [positiveClassNames]: data?.buyer.id === partyId,
            [negativeClassNames]: data?.seller.id,
          });
        },
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: Fills_party_tradesConnection_edges_node['size'];
        }) => {
          if (value && data) {
            let prefix;
            if (data?.buyer.id === partyId) {
              prefix = '+';
            } else if (data?.seller.id) {
              prefix = '-';
            }

            const size = addDecimalsFormatNumber(
              value,
              data?.market.positionDecimalPlaces
            );
            return `${prefix}${size}`;
          }
          return '-';
        },
      },
      {
        colId: 'value',
        headerName: t('Value'),
        field: 'price',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: Fills_party_tradesConnection_edges_node['price'];
        }) => {
          if (value && data) {
            const asset =
              data?.market.tradableInstrument.instrument.product.settlementAsset
                .symbol;
            const valueFormatted = addDecimalsFormatNumber(
              value,
              data?.market.decimalPlaces
            );
            return `${valueFormatted} ${asset}`;
          }
          return '-';
        },
        type: 'rightAligned',
      },
      {
        colId: 'filledvalue',
        headerName: t('Filled value'),
        field: 'price',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: Fills_party_tradesConnection_edges_node['price'];
        }) => {
          if (value && data) {
            const asset =
              data?.market.tradableInstrument.instrument.product.settlementAsset
                .symbol;
            const size = new BigNumber(
              addDecimal(data?.size, data?.market.positionDecimalPlaces)
            );
            const price = new BigNumber(
              addDecimal(value, data?.market.decimalPlaces)
            );

            const total = size.times(price).toString();
            const valueFormatted = formatNumber(
              total,
              data?.market.decimalPlaces
            );
            return `${valueFormatted} ${asset}`;
          }
          return '-';
        },
        type: 'rightAligned',
      },
      {
        colId: 'role',
        headerName: t('Role'),
        field: 'aggressor',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: Fills_party_tradesConnection_edges_node['aggressor'];
        }) => {
          if (value && data) {
            const taker = t('Taker');
            const maker = t('Maker');
            if (data?.buyer.id === partyId) {
              if (value === Side.SIDE_BUY) {
                return taker;
              } else {
                return maker;
              }
            } else if (data?.seller.id === partyId) {
              if (value === Side.SIDE_SELL) {
                return taker;
              } else {
                return maker;
              }
            }
          }
          return '-';
        },
      },
      {
        colId: 'fee',
        headerName: t('Fee'),
        field: 'market.tradableInstrument.instrument.product',
        valueFormatter: ({
          value,
          data,
        }: ValueFormatterParams & {
          value?: FillFields_market_tradableInstrument_instrument_product;
        }) => {
          if (value && data) {
            const asset = value.settlementAsset;
            let feesObj;
            if (data?.buyer.id === partyId) {
              feesObj = data?.buyerFee;
            } else if (data?.seller.id === partyId) {
              feesObj = data?.sellerFee;
            } else {
              return '-';
            }

            const fee = new BigNumber(feesObj.makerFee)
              .plus(feesObj.infrastructureFee)
              .plus(feesObj.liquidityFee);
            const totalFees = addDecimalsFormatNumber(
              fee.toString(),
              asset.decimals
            );
            return `${totalFees} ${asset.symbol}`;
          }
          return '-';
        },
        type: 'rightAligned',
      },
      {
        colId: 'date',
        headerName: t('Date'),
        field: 'createdAt',
        valueFormatter: ({
          value,
        }: ValueFormatterParams & {
          value: Fills_party_tradesConnection_edges_node['createdAt'];
        }) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '-';
        },
      },
    ];
  }, [partyId]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      unSortIcon: true,
    };
  }, []);
  return { columnDefs, defaultColDef };
};

export default useColumnDefinitions;
