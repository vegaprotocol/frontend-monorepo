import { useMemo } from 'react';
import {
  type AgGridReact,
  type AgGridReactProps,
  type AgReactUiProps,
} from 'ag-grid-react';
import { type ITooltipParams, type ColDef } from 'ag-grid-community';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  isNumeric,
} from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  AgGrid,
  positiveClassNames,
  negativeClassNames,
  MarketNameCell,
  COL_DEFS,
  DateRangeFilter,
} from '@vegaprotocol/datagrid';
import {
  type VegaValueFormatterParams,
  type VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { forwardRef } from 'react';
import BigNumber from 'bignumber.js';
import { type Trade } from './fills-data-provider';
import { FillActionsDropdown } from './fill-actions-dropdown';
import { getAsset, getQuoteUnit } from '@vegaprotocol/markets';
import { useT } from './use-t';
import { MAKER, TAKER, getFeesBreakdown, getRoleAndFees } from './fills-utils';

type Props = (AgGridReactProps | AgReactUiProps) & {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
};

export const FillsTable = forwardRef<AgGridReact, Props>(
  ({ partyId, onMarketClick, ...props }, ref) => {
    const t = useT();
    const columnDefs = useMemo<ColDef[]>(
      () => [
        {
          headerName: t('Market'),
          field: 'market.tradableInstrument.instrument.code',
          cellRenderer: 'MarketNameCell',
          cellRendererParams: { idPath: 'market.id', onMarketClick },
          pinned: true,
        },
        {
          headerName: t('Size'),
          type: 'rightAligned',
          field: 'size',
          cellClassRules: {
            [positiveClassNames]: ({ data }: { data: Trade }) => {
              const partySide = getPartySide(data, partyId);
              return partySide === 'buyer';
            },
            [negativeClassNames]: ({ data }: { data: Trade }) => {
              const partySide = getPartySide(data, partyId);
              return partySide === 'seller';
            },
          },
          valueFormatter: formatSize(partyId),
        },
        {
          headerName: t('Price'),
          field: 'price',
          valueFormatter: formatPrice,
          type: 'rightAligned',
        },
        {
          headerName: t('Notional'),
          field: 'price',
          valueFormatter: formatTotal,
          type: 'rightAligned',
        },
        {
          headerName: t('Role'),
          field: 'aggressor',
          valueFormatter: formatRole(partyId),
        },
        {
          headerName: t('Fee'),
          colId: 'fee',
          field: 'market',
          valueFormatter: formatFee(partyId),
          tooltipComponent: FeesBreakdownTooltip,
          type: 'rightAligned',
          tooltipField: 'market',
          tooltipComponentParams: { partyId },
        },
        {
          headerName: t('Fee Discount'),
          colId: 'fee-discount',
          field: 'market',
          valueFormatter: formatFeeDiscount(partyId),
          tooltipValueGetter: ({ valueFormatted, value }) => {
            return valueFormatted && /[1-9]/.test(valueFormatted)
              ? valueFormatted
              : null;
          },
          type: 'rightAligned',
          // return null to disable tooltip if fee discount is 0 or empty
          cellRenderer: ({
            value,
            valueFormatted,
          }: VegaICellRendererParams<Trade, 'market'>) =>
            `${valueFormatted} ${(value && getAsset(value))?.symbol}`,
          tooltipComponent: FeesDiscountBreakdownTooltip,
          tooltipComponentParams: { partyId },
        },
        {
          headerName: t('Date'),
          filter: DateRangeFilter,
          field: 'createdAt',
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<Trade, 'createdAt'>) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '';
          },
        },
        {
          colId: 'fill-actions',
          cellRenderer: ({ data }: VegaICellRendererParams<Trade, 'id'>) => {
            if (!data) return null;
            return (
              <FillActionsDropdown
                buyOrderId={data.buyOrder}
                sellOrderId={data.sellOrder}
                tradeId={data.id}
              />
            );
          },
          ...COL_DEFS.actions,
        },
      ],
      [onMarketClick, partyId, t]
    );
    return (
      <AgGrid
        ref={ref}
        columnDefs={columnDefs}
        defaultColDef={COL_DEFS.default}
        overlayNoRowsTemplate={t('No fills')}
        getRowId={({ data }) => data?.id}
        tooltipShowDelay={0}
        tooltipHideDelay={10000}
        components={{ MarketNameCell }}
        {...props}
      />
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
  const unit = getQuoteUnit(
    data.market.tradableInstrument.instrument.metadata.tags
  );
  const valueFormatted = addDecimalsFormatNumber(
    value,
    data?.market.decimalPlaces
  );
  return `${valueFormatted} ${unit}`;
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
  const { symbol: assetSymbol, decimals: assetDecimals } = getAsset(
    data.market
  );
  const size = new BigNumber(
    addDecimal(data?.size, data?.market.positionDecimalPlaces)
  );
  const price = new BigNumber(addDecimal(value, data?.market.decimalPlaces));
  const total = size.times(price).toString();
  const valueFormatted = formatNumber(total, assetDecimals);
  return `${valueFormatted} ${assetSymbol}`;
};

const formatRole = (partyId: string) => {
  return ({ data }: VegaValueFormatterParams<Trade, 'aggressor'>) => {
    if (!data) return '-';
    const { role } = getRoleAndFees({ data, partyId });
    return role;
  };
};

const formatFee = (partyId: string) => {
  return ({
    value: market,
    data,
  }: VegaValueFormatterParams<Trade, 'market'>) => {
    if (!market || !data) return '-';
    const asset = getAsset(market);
    const { fees: feesObj, role } = getRoleAndFees({ data, partyId });
    if (!feesObj) return '-';

    const { totalFee } = getFeesBreakdown(role, feesObj);
    const totalFees = addDecimalsFormatNumber(totalFee, asset.decimals);
    return `${totalFees} ${asset.symbol}`;
  };
};

const formatFeeDiscount = (partyId: string) => {
  return ({
    value: market,
    data,
  }: VegaValueFormatterParams<Trade, 'market'>) => {
    if (!market || !data) return '-';
    const asset = getAsset(market);
    const { fees: roleFees, role } = getRoleAndFees({ data, partyId });
    if (!roleFees) return '-';
    const { totalFeeDiscount } = getFeesBreakdown(role, roleFees);
    return addDecimalsFormatNumber(totalFeeDiscount, asset.decimals);
  };
};

const FeesBreakdownTooltip = ({
  data,
  value: market,
  partyId,
}: ITooltipParams<Trade, Trade['market']> & { partyId?: string }) => {
  const t = useT();
  if (!market || !data) {
    return null;
  }

  const asset = getAsset(market);

  const { role, fees, marketState } = getRoleAndFees({ data, partyId }) ?? {};
  if (!fees) return null;
  const { infrastructureFee, liquidityFee, makerFee, totalFee } =
    getFeesBreakdown(role, fees, marketState);

  return (
    <div
      data-testid="fee-breakdown-tooltip"
      className="bg-surface-1 border break-word z-20 max-w-sm rounded px-4 py-2 text-xs text-gs-0"
    >
      {marketState && (
        <p className="mb-1 italic">
          {t('If the market was {{state}}', {
            state: Schema.MarketStateMapping[marketState].toLowerCase(),
          })}
        </p>
      )}
      {role === MAKER && (
        <>
          <p className="mb-1">
            {t(
              `Fee revenue to be received by the maker, takers' fee discounts already applied.`
            )}
          </p>
          <p className="mb-1">
            {t(
              'During continuous trading the maker pays no infrastructure and liquidity fees.'
            )}
          </p>
        </>
      )}
      {role === TAKER && (
        <p className="mb-1">
          {t('Fees to be paid by the taker; discounts are already applied.')}
        </p>
      )}
      {(role === '-' || marketState === Schema.MarketState.STATE_SUSPENDED) && (
        <p className="mb-1">
          {t(
            'During auction, half the infrastructure and liquidity fees will be paid.'
          )}
        </p>
      )}
      <dl className="grid grid-cols-2 gap-x-1">
        <dt className="col-span-1">{t('Infrastructure fee')}</dt>
        <dd className="col-span-1 text-right">
          {addDecimalsFormatNumber(infrastructureFee, asset.decimals)}{' '}
          {asset.symbol}
        </dd>
        <dt className="col-span-1">{t('Liquidity fee')}</dt>
        <dd className="col-span-1 text-right">
          {addDecimalsFormatNumber(liquidityFee, asset.decimals)} {asset.symbol}
        </dd>
        <dt className="col-span-1">{t('Maker fee')}</dt>
        <dd className="col-span-1 text-right">
          {addDecimalsFormatNumber(makerFee, asset.decimals)} {asset.symbol}
        </dd>
        <dt className="col-span-1">{t('Total fees')}</dt>
        <dd className="col-span-1 text-right">
          {addDecimalsFormatNumber(totalFee, asset.decimals)} {asset.symbol}
        </dd>
      </dl>
    </div>
  );
};

const FeesDiscountBreakdownTooltipItem = ({
  value,
  label,
  asset,
}: {
  value?: string | null;
  label: string;
  asset: ReturnType<typeof getAsset>;
}) =>
  value && value !== '0' ? (
    <>
      <dt className="col-span-2">{label}</dt>
      <dd className="col-span-2 text-right">
        {addDecimalsFormatNumber(value, asset.decimals)} {asset.symbol}
      </dd>
    </>
  ) : null;

export const FeesDiscountBreakdownTooltip = ({
  data,
  partyId,
}: ITooltipParams<Trade, Trade['market']> & { partyId?: string }) => {
  const t = useT();
  if (!data || !data.market) {
    return null;
  }
  const asset = getAsset(data.market);

  const {
    fees: roleFees,
    marketState,
    role,
  } = getRoleAndFees({ data, partyId }) ?? {};
  if (!roleFees) return null;
  const fees = getFeesBreakdown(role, roleFees, marketState);
  return (
    <div
      data-testid="fee-discount-breakdown-tooltip"
      className="bg-gs-100 border-gs-200 break-word z-20 max-w-sm rounded border px-4 py-2 text-sm text-gs-0"
    >
      <dl className="grid grid-cols-6 gap-x-1 text-xs">
        {(fees.infrastructureFeeReferralDiscount || '0') !== '0' ||
        (fees.infrastructureFeeVolumeDiscount || '0') !== '0' ? (
          <dt className="col-span-2">{t('Infrastructure Fee')}</dt>
        ) : null}
        <FeesDiscountBreakdownTooltipItem
          value={fees.infrastructureFeeReferralDiscount}
          label={t('Referral Discount')}
          asset={asset}
        />
        <FeesDiscountBreakdownTooltipItem
          value={fees.infrastructureFeeVolumeDiscount}
          label={t('Volume Discount')}
          asset={asset}
        />
        {(fees.liquidityFeeReferralDiscount || '0') !== '0' ||
        (fees.liquidityFeeVolumeDiscount || '0') !== '0' ? (
          <dt className="col-span-2">{t('Liquidity Fee')}</dt>
        ) : null}

        <FeesDiscountBreakdownTooltipItem
          value={fees.liquidityFeeReferralDiscount}
          label={t('Referral Discount')}
          asset={asset}
        />
        <FeesDiscountBreakdownTooltipItem
          value={fees.liquidityFeeVolumeDiscount}
          label={t('Volume Discount')}
          asset={asset}
        />
        {(fees.makerFeeReferralDiscount || '0') !== '0' ||
        (fees.makerFeeVolumeDiscount || '0') !== '0' ? (
          <dt className="col-span-2">{t('Maker Fee')}</dt>
        ) : null}
        <FeesDiscountBreakdownTooltipItem
          value={fees.makerFeeReferralDiscount}
          label={t('Referral Discount')}
          asset={asset}
        />
        <FeesDiscountBreakdownTooltipItem
          value={fees.makerFeeVolumeDiscount}
          label={t('Volume Discount')}
          asset={asset}
        />

        <dt className="col-span-2">{t('Total Fee Discount')}</dt>
        <FeesDiscountBreakdownTooltipItem
          value={fees.totalFeeDiscount}
          label={''}
          asset={asset}
        />
      </dl>
    </div>
  );
};
