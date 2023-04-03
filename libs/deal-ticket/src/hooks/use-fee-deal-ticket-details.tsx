import { FeesBreakdown } from '@vegaprotocol/market-info';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
} from '../constants';
import { useOrderCloseOut } from './use-order-closeout';
import { useMarketAccountBalance } from '@vegaprotocol/accounts';
import { getDerivedPrice } from '../utils/get-price';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';
import type { EstimateOrderQuery } from './__generated__/EstimateOrder';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: Market,
  marketData: MarketData
) => {
  const { pubKey } = useVegaWallet();
  const { accountBalance } = useMarketAccountBalance(market.id);

  const price = useMemo(() => {
    return getDerivedPrice(order, marketData);
  }, [order, marketData]);

  const { data: estMargin } = useEstimateOrderQuery({
    variables: {
      marketId: market.id,
      partyId: pubKey || '',
      price,
      size: order.size,
      side: order.side,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    skip: !pubKey || !market || !order.size || !price,
  });

  const estCloseOut = useOrderCloseOut({
    order,
    market,
    marketData,
  });

  const notionalSize = useMemo(() => {
    if (price && order.size) {
      return toBigNum(order.size, market.positionDecimalPlaces)
        .multipliedBy(addDecimal(price, market.decimalPlaces))
        .toString();
    }
    return null;
  }, [price, order.size, market.decimalPlaces, market.positionDecimalPlaces]);

  const assetSymbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;

  return useMemo(() => {
    return {
      market,
      assetSymbol,
      notionalSize,
      accountBalance,
      estimateOrder: estMargin?.estimateOrder,
      estCloseOut,
    };
  }, [
    market,
    assetSymbol,
    notionalSize,
    accountBalance,
    estMargin,
    estCloseOut,
  ]);
};

export interface FeeDetails {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  market: Market;
  assetSymbol: string;
  notionalSize: string | null;
  estCloseOut: string | null;
  estimateOrder: EstimateOrderQuery['estimateOrder'] | undefined;
  estimatedInitialMargin: string;
  estimatedTotalInitialMargin: string;
  currentInitialMargin?: string;
  currentMaintenanceMargin?: string;
}

export const getFeeDetailsValues = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  estimateOrder,
  market,
  notionalSize,
  estimatedTotalInitialMargin,
  currentInitialMargin,
  currentMaintenanceMargin,
}: FeeDetails) => {
  const totalBalance =
    BigInt(generalAccountBalance || '0') + BigInt(marginAccountBalance || '0');
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  const formatValueWithMarketDp = (
    value: string | number | null | undefined
  ): string => {
    return value && !isNaN(Number(value))
      ? formatNumber(value, market.decimalPlaces)
      : '-';
  };
  const formatValueWithAssetDp = (
    value: string | number | null | undefined
  ): string => {
    return value && !isNaN(Number(value))
      ? addDecimalsFormatNumber(value, assetDecimals)
      : '-';
  };
  const details: {
    label: string;
    value?: string | null;
    symbol: string;
    indent?: boolean;
    labelDescription?: React.ReactNode;
  }[] = [
    {
      label: t('Notional'),
      value: formatValueWithMarketDp(notionalSize),
      symbol: assetSymbol,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT(assetSymbol),
    },
    {
      label: t('Fees'),
      value:
        estimateOrder?.totalFeeAmount &&
        `~${formatValueWithAssetDp(estimateOrder?.totalFeeAmount)}`,
      labelDescription: (
        <>
          <span>
            {t(
              `An estimate of the most you would be expected to pay in fees, in the market's settlement asset ${assetSymbol}.`
            )}
          </span>
          <FeesBreakdown
            fees={estimateOrder?.fee}
            feeFactors={market.fees.factors}
            symbol={assetSymbol}
            decimals={assetDecimals}
          />
        </>
      ),
      symbol: assetSymbol,
    },
    {
      label: t('Margin required'),
      value: `~${formatValueWithAssetDp(
        currentInitialMargin
          ? (
              BigInt(estimatedTotalInitialMargin) - BigInt(currentInitialMargin)
            ).toString()
          : estimatedTotalInitialMargin
      )}`,
      symbol: assetSymbol,
      labelDescription: MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol),
    },
  ];
  if (totalBalance) {
    const totalMarginAvailable = (
      currentMaintenanceMargin
        ? totalBalance - BigInt(currentMaintenanceMargin)
        : totalBalance
    ).toString();

    details.push({
      indent: true,
      label: t('Total margin available'),
      value: `~${formatValueWithAssetDp(totalMarginAvailable)}`,
      symbol: assetSymbol,
      labelDescription: TOTAL_MARGIN_AVAILABLE(
        formatValueWithAssetDp(generalAccountBalance),
        formatValueWithAssetDp(marginAccountBalance),
        formatValueWithAssetDp(currentMaintenanceMargin),
        assetSymbol
      ),
    });

    if (marginAccountBalance) {
      const deductionFromCollateral =
        BigInt(estimatedTotalInitialMargin) - BigInt(marginAccountBalance);

      details.push({
        indent: true,
        label: t('Deduction from collateral'),
        value: `~${formatValueWithAssetDp(
          deductionFromCollateral > 0 ? deductionFromCollateral.toString() : '0'
        )}`,
        symbol: assetSymbol,
        labelDescription: DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT(assetSymbol),
      });
    }

    details.push({
      label: t('Projected margin'),
      value: `~${formatValueWithAssetDp(estimatedTotalInitialMargin)}`,
      symbol: assetSymbol,
      labelDescription: EST_TOTAL_MARGIN_TOOLTIP_TEXT,
    });
  }
  details.push({
    label: t('Current margin allocation'),
    value: `${formatValueWithAssetDp(marginAccountBalance)}`,
    symbol: assetSymbol,
    labelDescription: MARGIN_ACCOUNT_TOOLTIP_TEXT,
  });
  return details;
};
