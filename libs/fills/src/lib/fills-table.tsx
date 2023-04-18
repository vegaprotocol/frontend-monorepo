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
  isNumeric,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { AgGridColumn } from 'ag-grid-react';
import {
  AgGridDynamic as AgGrid,
  positiveClassNames,
  negativeClassNames,
  MarketNameCell,
} from '@vegaprotocol/datagrid';
import type { VegaValueFormatterParams } from '@vegaprotocol/datagrid';
import { forwardRef } from 'react';
import BigNumber from 'bignumber.js';
import type { Trade } from './fills-data-provider';
import type { FillFieldsFragment } from './__generated__/Fills';

const TAKER = 'TAKER';
const MAKER = 'MAKER';

export type Props = (AgGridReactProps | AgReactUiProps) & {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
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
        components={{ MarketNameCell }}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          cellRenderer="MarketNameCell"
          cellRendererParams={{ idPath: 'market.id', onMarketClick }}
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
    const { fees: feesObj, role } = getRoleAndFees({ data, partyId });
    if (!feesObj) return '-';

    const { totalFee } = getFeesBreakdown(role, feesObj);
    const totalFees = addDecimalsFormatNumber(totalFee, asset.decimals);
    return `${totalFees} ${asset.symbol}`;
  };
};

export const getRoleAndFees = ({
  data,
  partyId,
}: {
  data: Pick<
    FillFieldsFragment,
    'buyerFee' | 'sellerFee' | 'buyer' | 'seller' | 'aggressor'
  >;
  partyId?: string;
}) => {
  let role;
  let feesObj;
  if (data?.buyer.id === partyId) {
    role = data.aggressor === Schema.Side.SIDE_BUY ? TAKER : MAKER;
    feesObj = role === TAKER ? data?.buyerFee : data.sellerFee;
  } else if (data?.seller.id === partyId) {
    role = data.aggressor === Schema.Side.SIDE_SELL ? TAKER : MAKER;
    feesObj = role === TAKER ? data?.sellerFee : data.buyerFee;
  } else {
    return { role: '-', feesObj: '-' };
  }
  return { role, fees: feesObj };
};

const FeesBreakdownTooltip = ({
  data,
  value,
  partyId,
}: ITooltipParams & { partyId?: string }) => {
  if (!value?.settlementAsset || !data) {
    return null;
  }

  const asset = value.settlementAsset;

  const { role, fees: feesObj } = getRoleAndFees({ data, partyId }) ?? {};
  if (!feesObj) return null;
  const { infrastructureFee, liquidityFee, makerFee, totalFee } =
    getFeesBreakdown(role, feesObj);

  return (
    <div
      data-testid="fee-breakdown-tooltip"
      className="max-w-sm border border-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 z-20 rounded text-sm break-word text-black dark:text-white"
    >
      {role === MAKER && (
        <>
          <p className="mb-1">{t('The maker will receive the maker fee.')}</p>
          <p className="mb-1">
            {t(
              'If the market is in monitoring auction the maker will pay half of the infrastructure and liquidity fees.'
            )}
          </p>
          <p className="mb-1">
            {t(
              'If the market is active the maker will pay zero infrastructure and liquidity fees.'
            )}
          </p>
        </>
      )}
      {role === TAKER && (
        <>
          <p className="mb-1">{t('Fees to be paid by the taker.')}</p>
          <p className="mb-1">
            {t(
              'If the market is in monitoring auction the taker will pay half of the infrastructure and liquidity fees.'
            )}
          </p>
        </>
      )}
      <dl className="grid grid-cols-2 gap-x-1">
        <dt className="col-span-1">{t('Infrastructure fee')}</dt>
        <dd className="text-right col-span-1">
          {addDecimalsFormatNumber(infrastructureFee, asset.decimals)}{' '}
          {asset.symbol}
        </dd>
        <dt className="col-span-1">{t('Liquidity fee')}</dt>
        <dd className="text-right col-span-1">
          {addDecimalsFormatNumber(liquidityFee, asset.decimals)} {asset.symbol}
        </dd>
        <dt className="col-span-1">{t('Maker fee')}</dt>
        <dd className="text-right col-span-1">
          {addDecimalsFormatNumber(makerFee, asset.decimals)} {asset.symbol}
        </dd>
        <dt className="col-span-1">{t('Total fees')}</dt>
        <dd className="text-right col-span-1">
          {addDecimalsFormatNumber(totalFee, asset.decimals)} {asset.symbol}
        </dd>
      </dl>
    </div>
  );
};

export const getFeesBreakdown = (
  role: string,
  feesObj: {
    __typename?: 'TradeFee' | undefined;
    makerFee: string;
    infrastructureFee: string;
    liquidityFee: string;
  }
) => {
  const makerFee =
    role === MAKER
      ? new BigNumber(feesObj.makerFee).times(-1).toString()
      : feesObj.makerFee;
  const infrastructureFee = feesObj.infrastructureFee;
  const liquidityFee = feesObj.liquidityFee;

  const totalFee = new BigNumber(infrastructureFee)
    .plus(makerFee)
    .plus(liquidityFee)
    .toString();
  return {
    infrastructureFee,
    liquidityFee,
    makerFee,
    totalFee,
  };
};
