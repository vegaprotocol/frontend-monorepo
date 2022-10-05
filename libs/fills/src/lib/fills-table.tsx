import type { AgGridReact } from 'ag-grid-react';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  positiveClassNames,
  negativeClassNames,
  t,
} from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';
import { AgGridColumn } from 'ag-grid-react';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';
import BigNumber from 'bignumber.js';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type { Trade } from './fills-data-provider';

export type Props = (AgGridReactProps | AgReactUiProps) & {
  partyId: string;
};

export const FillsTable = forwardRef<AgGridReact, Props>(
  ({ partyId, ...props }, ref) => {
    return (
      <AgGrid
        ref={ref}
        overlayNoRowsTemplate={t('No fills')}
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data?.id}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
        />
        <AgGridColumn
          headerName={t('Size')}
          type="rightAligned"
          field="size"
          cellClassRules={{
            [positiveClassNames]: ({ data }: { data: Trade }) => {
              const partySide = getPartySide(data, partyId);
              return partySide === 'buyer';
            },
            [negativeClassNames]: ({ data }: { data: Trade }) => {
              const partySide = getPartySide(data, partyId);
              return partySide === 'seller';
            },
          }}
          valueFormatter={formatSize(partyId)}
        />
        <AgGridColumn
          headerName={t('Value')}
          field="price"
          valueFormatter={formatPrice}
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Filled value')}
          field="price"
          valueFormatter={formatTotal}
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Role')}
          field="aggressor"
          valueFormatter={formatRole(partyId)}
        />
        <AgGridColumn
          headerName={t('Fee')}
          field="market.tradableInstrument.instrument.product"
          valueFormatter={formatFee(partyId)}
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Date')}
          field="createdAt"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Trade, 'createdAt'>) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
      </AgGrid>
    );
  }
);

const formatPrice = ({
  value,
  data,
}: VegaValueFormatterParams<Trade, 'price'>) => {
  if (!data.market) {
    return '-';
  }
  const asset =
    data?.market.tradableInstrument.instrument.product.settlementAsset.symbol;
  const valueFormatted = addDecimalsFormatNumber(
    value,
    data?.market.decimalPlaces
  );
  return `${valueFormatted} ${asset}`;
};

const formatSize = (partyId: string) => {
  return ({ value, data }: VegaValueFormatterParams<Trade, 'size'>) => {
    if (!data.market) {
      return '-';
    }
    let prefix = '';
    const partySide = getPartySide(data, partyId);

    if (partySide === 'buyer') {
      prefix = '+';
    } else if (partySide === 'seller') {
      prefix = '-';
    }

    const size = addDecimalsFormatNumber(
      value,
      data?.market.positionDecimalPlaces
    );
    return `${prefix}${size}`;
  };
};

const getPartySide = (
  data: Trade,
  partyId: string
): 'buyer' | 'seller' | undefined => {
  let result = undefined;
  if (data?.buyer.id === partyId) {
    result = 'buyer' as const;
  } else if (data?.seller.id === partyId) {
    result = 'seller' as const;
  }
  return result;
};

const formatTotal = ({
  value,
  data,
}: VegaValueFormatterParams<Trade, 'price'>) => {
  if (!data?.market) {
    return '-';
  }
  const asset =
    data?.market.tradableInstrument.instrument.product.settlementAsset.symbol;
  const size = new BigNumber(
    addDecimal(data?.size, data?.market.positionDecimalPlaces)
  );
  const price = new BigNumber(addDecimal(value, data?.market.decimalPlaces));

  const total = size.times(price).toString();
  const valueFormatted = formatNumber(total, data?.market.decimalPlaces);
  return `${valueFormatted} ${asset}`;
};

const formatRole = (partyId: string) => {
  return ({ value, data }: VegaValueFormatterParams<Trade, 'aggressor'>) => {
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
    } else {
      return '-';
    }
  };
};

const formatFee = (partyId: string) => {
  return ({
    value,
    data,
  }: VegaValueFormatterParams<
    Trade,
    'market.tradableInstrument.instrument.product'
  >) => {
    if (!value?.settlementAsset) {
      return '-';
    }
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
    const totalFees = addDecimalsFormatNumber(fee.toString(), asset.decimals);
    return `${totalFees} ${asset.symbol}`;
  };
};
