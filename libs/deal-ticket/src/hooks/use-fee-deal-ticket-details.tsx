import { FeesBreakdown } from '@vegaprotocol/market-info';
import { addDecimalsFormatNumber, formatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { Market } from '@vegaprotocol/market-list';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
} from '../constants';

import { useEstimateFeesQuery } from './__generated__/EstimateOrder';
import type { EstimateFeesQuery } from './__generated__/EstimateOrder';

export const useFeeDealTicketDetails = (
  order?: OrderSubmissionBody['orderSubmission']
) => {
  const { pubKey } = useVegaWallet();

  const { data } = useEstimateFeesQuery({
    variables: order && {
      marketId: order.marketId,
      partyId: pubKey || '',
      price: order.price,
      size: order.size,
      side: order.side,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    skip: !pubKey || !order?.size || !order?.price,
  });
  return data?.estimateFees;
};

export interface FeeDetails {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  market: Market;
  assetSymbol: string;
  notionalSize: string | null;
  estimateFees: EstimateFeesQuery['estimateFees'] | undefined;
  currentInitialMargin?: string;
  currentMaintenanceMargin?: string;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
}

export const getFeeDetailsValues = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  estimateFees,
  market,
  notionalSize,
  currentInitialMargin,
  currentMaintenanceMargin,
  positionEstimate,
}: FeeDetails) => {
  const liquidationEstimate = positionEstimate?.liquidation;
  const marginEstimate = positionEstimate?.margin;
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
        estimateFees?.totalFeeAmount &&
        `~${formatValueWithAssetDp(estimateFees?.totalFeeAmount)}`,
      labelDescription: (
        <>
          <span>
            {t(
              `An estimate of the most you would be expected to pay in fees, in the market's settlement asset ${assetSymbol}.`
            )}
          </span>
          <FeesBreakdown
            fees={estimateFees?.fees}
            feeFactors={market.fees.factors}
            symbol={assetSymbol}
            decimals={assetDecimals}
          />
        </>
      ),
      symbol: assetSymbol,
    },
  ];
  if (marginEstimate) {
    details.push({
      label: t('Margin required'),
      value: `~${formatValueWithAssetDp(
        currentInitialMargin
          ? (
              BigInt(marginEstimate.bestCase.initialLevel) -
              BigInt(currentInitialMargin)
            ).toString()
          : marginEstimate.bestCase.initialLevel
      )}`,
      symbol: assetSymbol,
      labelDescription: MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol),
    });
    details.push({
      label: t('Margin required worst case'),
      value: `~${formatValueWithAssetDp(
        currentInitialMargin
          ? (
              BigInt(marginEstimate.worstCase.initialLevel) -
              BigInt(currentInitialMargin)
            ).toString()
          : marginEstimate.worstCase.initialLevel
      )}`,
      symbol: assetSymbol,
      labelDescription: MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol),
    });
  }
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
  }
  if (marginEstimate) {
    if (marginAccountBalance) {
      const deductionFromCollateralBestCase =
        BigInt(marginEstimate.bestCase.initialLevel) -
        BigInt(marginAccountBalance);

      details.push({
        indent: true,
        label: t('Deduction from collateral'),
        value: `~${formatValueWithAssetDp(
          deductionFromCollateralBestCase > 0
            ? deductionFromCollateralBestCase.toString()
            : '0'
        )}`,
        symbol: assetSymbol,
        labelDescription: DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT(assetSymbol),
      });

      const deductionFromCollateralWorstCase =
        BigInt(marginEstimate.worstCase.initialLevel) -
        BigInt(marginAccountBalance);

      details.push({
        indent: true,
        label: t('Deduction from collateral worst case'),
        value: `~${formatValueWithAssetDp(
          deductionFromCollateralWorstCase > 0
            ? deductionFromCollateralWorstCase.toString()
            : '0'
        )}`,
        symbol: assetSymbol,
        labelDescription: DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT(assetSymbol),
      });
    }

    details.push({
      label: t('Projected margin'),
      value: `~${formatValueWithAssetDp(marginEstimate.bestCase.initialLevel)}`,
      symbol: assetSymbol,
      labelDescription: EST_TOTAL_MARGIN_TOOLTIP_TEXT,
    });

    details.push({
      label: t('Projected margin worst case'),
      value: `~${formatValueWithAssetDp(
        marginEstimate.worstCase.initialLevel
      )}`,
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
  if (liquidationEstimate) {
    const liquidationEstimateBestCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.bestCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCaseIncludingSellOrders = BigInt(
      liquidationEstimate.bestCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCase =
      liquidationEstimateBestCaseIncludingBuyOrders >
      liquidationEstimateBestCaseIncludingSellOrders
        ? liquidationEstimateBestCaseIncludingBuyOrders
        : liquidationEstimateBestCaseIncludingSellOrders;
    details.push({
      label: t('Liquidation price estimate'),
      value: `${formatValueWithAssetDp(
        liquidationEstimateBestCase.toString()
      )}`,
      symbol: assetSymbol,
      labelDescription: MARGIN_ACCOUNT_TOOLTIP_TEXT,
    });

    const liquidationEstimateWorstCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.worstCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCaseIncludingSellOrders = BigInt(
      liquidationEstimate.worstCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCase =
      liquidationEstimateWorstCaseIncludingBuyOrders >
      liquidationEstimateWorstCaseIncludingSellOrders
        ? liquidationEstimateWorstCaseIncludingBuyOrders
        : liquidationEstimateWorstCaseIncludingSellOrders;
    details.push({
      label: t('Liquidation price estimate worst case'),
      value: `${formatValueWithAssetDp(
        liquidationEstimateWorstCase.toString()
      )}`,
      symbol: assetSymbol,
      labelDescription: MARGIN_ACCOUNT_TOOLTIP_TEXT,
    });
  }
  return details;
};
