import type {
  AgGridReact,
  AgGridReactProps,
  AgReactUiProps,
} from 'ag-grid-react';
import type { ITooltipParams } from 'ag-grid-community';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  positiveClassNames,
  negativeClassNames,
  t,
  isNumeric,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { AgGridColumn } from 'ag-grid-react';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { Link } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';
import BigNumber from 'bignumber.js';
import type { Trade } from './fills-data-provider';

export type Props = (AgGridReactProps | AgReactUiProps) & {
  partyId: string;
  onMarketClick?: (marketId: string) => void;
};

export const FillsTable = forwardRef<AgGridReact, Props>(
  ({ partyId, onMarketClick, ...props }, ref) => {
    return (
      <AgGrid
        ref={ref}
        overlayNoRowsTemplate={t('No fills')}
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data?.id}
        tooltipShowDelay={0}
        tooltipHideDelay={2000}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          cellRenderer={({
            value,
            data,
          }: VegaICellRendererParams<
            Trade,
            'market.tradableInstrument.instrument.name'
          >) =>
            onMarketClick ? (
              <Link
                onClick={() =>
                  data?.market?.id && onMarketClick(data?.market?.id)
                }
              >
                {value}
              </Link>
            ) : (
              value
            )
          }
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
          headerName={t('Price')}
          field="price"
          valueFormatter={formatPrice}
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Notional')}
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
          tooltipField="market.tradableInstrument.instrument.product"
          tooltipComponent={FeesBreakdownTooltip}
          tooltipComponentParams={{ partyId }}
        />
        <AgGridColumn
          headerName={t('Date')}
          field="createdAt"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Trade, 'createdAt'>) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '';
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
  if (!data?.market || !isNumeric(value)) {
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
    if (!data?.market || !isNumeric(value)) {
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
  if (!data?.market || !isNumeric(value)) {
    return '-';
  }
  const { symbol: assetSymbol, decimals: assetDecimals } =
    data?.market.tradableInstrument.instrument.product.settlementAsset ?? {};
  const size = new BigNumber(
    addDecimal(data?.size, data?.market.positionDecimalPlaces)
  );
  const price = new BigNumber(addDecimal(value, data?.market.decimalPlaces));
  const total = size.times(price).toString();
  const valueFormatted = formatNumber(total, assetDecimals);
  return `${valueFormatted} ${assetSymbol}`;
};

const formatRole = (partyId: string) => {
  return ({ value, data }: VegaValueFormatterParams<Trade, 'aggressor'>) => {
    const taker = t('Taker');
    const maker = t('Maker');
    if (data?.buyer.id === partyId) {
      if (value === Schema.Side.SIDE_BUY) {
        return taker;
      } else {
        return maker;
      }
    } else if (data?.seller.id === partyId) {
      if (value === Schema.Side.SIDE_SELL) {
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
    if (!value?.settlementAsset || !data) {
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

const FeesBreakdownTooltip = ({
  data,
  value,
  valueFormatted,
  partyId,
}: ITooltipParams & { partyId?: string }) => {
  if (!value?.settlementAsset || !data) {
    return null;
  }
  const asset = value.settlementAsset;
  let feesObj;
  if (data?.buyer.id === partyId) {
    feesObj = data?.buyerFee;
  } else if (data?.seller.id === partyId) {
    feesObj = data?.sellerFee;
  } else {
    return null;
  }

  return (
    <div
      data-testid="fee-breakdown-tooltip"
      className="max-w-sm border border-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 z-20 rounded text-sm break-word text-black dark:text-white"
    >
      <dl className="grid grid-cols-2 gap-x-2">
        <dt>{t('Infrastructure fee')}</dt>
        <dd className="text-right">
          {addDecimalsFormatNumber(feesObj.infrastructureFee, asset.decimals)}{' '}
          {asset.symbol}
        </dd>
        <dt>{t('Liquidity fee')}</dt>
        <dd className="text-right">
          {addDecimalsFormatNumber(feesObj.liquidityFee, asset.decimals)}{' '}
          {asset.symbol}
        </dd>
        <dt>{t('Maker fee')}</dt>
        <dd className="text-right">
          {addDecimalsFormatNumber(feesObj.makerFee, asset.decimals)}{' '}
          {asset.symbol}
        </dd>
        <dt>{t('Total fees')}</dt>
        <dd className="text-right">{valueFormatted}</dd>
      </dl>
    </div>
  );
};
