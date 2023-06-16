import { FeesBreakdown } from '@vegaprotocol/markets';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  isNumeric,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { Market } from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import type { DealTicketOrderSubmission } from '@vegaprotocol/wallet';
import {
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
} from '../constants';

import { useEstimateFeesQuery } from './__generated__/EstimateOrder';
import type { EstimateFeesQuery } from './__generated__/EstimateOrder';

export const useEstimateFees = (order?: DealTicketOrderSubmission) => {
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
    fetchPolicy: 'no-cache',
  });
  return data?.estimateFees;
};

export interface FeeDetails {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  market: Market;
  assetSymbol: string;
  notionalSize: string | null;
  feeEstimate: EstimateFeesQuery['estimateFees'] | undefined;
  currentInitialMargin?: string;
  currentMaintenanceMargin?: string;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
}

const emptyValue = '-';

export const formatValue = (
  value: string | number | null | undefined,
  formatDecimals: number,
  quantum?: string
): string => {
  if (!isNumeric(value)) return emptyValue;
  if (!quantum) return addDecimalsFormatNumber(value, formatDecimals);
  return addDecimalsFormatNumberQuantum(value, formatDecimals, quantum);
};

export const formatRange = (
  min: string | number | null | undefined,
  max: string | number | null | undefined,
  formatDecimals: number,
  quantum?: string
) => {
  const minFormatted = formatValue(min, formatDecimals, quantum);
  const maxFormatted = formatValue(max, formatDecimals, quantum);
  if (minFormatted !== maxFormatted) {
    return `${minFormatted} - ${maxFormatted}`;
  }
  if (minFormatted !== emptyValue) {
    return minFormatted;
  }
  return maxFormatted;
};

export const getFeeDetailsValues = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  feeEstimate,
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
  const quantum =
    market.tradableInstrument.instrument.product.settlementAsset.quantum;
  const details: {
    label: string;
    value?: string | null;
    formattedValue?: string | null;
    symbol: string;
    indent?: boolean;
    labelDescription?: React.ReactNode;
  }[] = [
    {
      label: t('Notional'),
      value: formatValue(notionalSize, assetDecimals),
      formattedValue: formatValue(notionalSize, assetDecimals, quantum),
      symbol: assetSymbol,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT(assetSymbol),
    },
    {
      label: t('Fees'),
      value:
        feeEstimate?.totalFeeAmount &&
        `~${formatValue(feeEstimate?.totalFeeAmount, assetDecimals)}`,
      formattedValue:
        feeEstimate?.totalFeeAmount &&
        `~${formatValue(feeEstimate?.totalFeeAmount, assetDecimals, quantum)}`,
      labelDescription: (
        <>
          <span>
            {t(
              `An estimate of the most you would be expected to pay in fees, in the market's settlement asset ${assetSymbol}.`
            )}
          </span>
          <FeesBreakdown
            fees={feeEstimate?.fees}
            feeFactors={market.fees.factors}
            symbol={assetSymbol}
            decimals={assetDecimals}
          />
        </>
      ),
      symbol: assetSymbol,
    },
  ];
  let marginRequiredBestCase: string | undefined = undefined;
  let marginRequiredWorstCase: string | undefined = undefined;
  if (marginEstimate) {
    if (currentInitialMargin) {
      marginRequiredBestCase = (
        BigInt(marginEstimate.bestCase.initialLevel) -
        BigInt(currentInitialMargin)
      ).toString();
      if (marginRequiredBestCase.startsWith('-')) {
        marginRequiredBestCase = '0';
      }
      marginRequiredWorstCase = (
        BigInt(marginEstimate.worstCase.initialLevel) -
        BigInt(currentInitialMargin)
      ).toString();
      if (marginRequiredWorstCase.startsWith('-')) {
        marginRequiredWorstCase = '0';
      }
    } else {
      marginRequiredBestCase = marginEstimate.bestCase.initialLevel;
      marginRequiredWorstCase = marginEstimate.worstCase.initialLevel;
    }
  }
  details.push({
    label: t('Margin required'),
    formattedValue: formatRange(
      marginRequiredBestCase,
      marginRequiredWorstCase,
      assetDecimals,
      quantum
    ),
    value: formatRange(
      marginRequiredBestCase,
      marginRequiredWorstCase,
      assetDecimals
    ),
    symbol: assetSymbol,
    labelDescription: MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol),
  });

  const totalMarginAvailable = (
    currentMaintenanceMargin
      ? totalBalance - BigInt(currentMaintenanceMargin)
      : totalBalance
  ).toString();

  details.push({
    indent: true,
    label: t('Total margin available'),
    formattedValue: formatValue(totalMarginAvailable, assetDecimals, quantum),
    value: formatValue(totalMarginAvailable, assetDecimals),
    symbol: assetSymbol,
    labelDescription: TOTAL_MARGIN_AVAILABLE(
      formatValue(generalAccountBalance, assetDecimals, quantum),
      formatValue(marginAccountBalance, assetDecimals, quantum),
      formatValue(currentMaintenanceMargin, assetDecimals, quantum),
      assetSymbol
    ),
  });

  if (marginAccountBalance) {
    const deductionFromCollateralBestCase =
      BigInt(marginEstimate?.bestCase.initialLevel ?? 0) -
      BigInt(marginAccountBalance);

    const deductionFromCollateralWorstCase =
      BigInt(marginEstimate?.worstCase.initialLevel ?? 0) -
      BigInt(marginAccountBalance);

    details.push({
      indent: true,
      label: t('Deduction from collateral'),
      value: formatRange(
        deductionFromCollateralBestCase > 0
          ? deductionFromCollateralBestCase.toString()
          : '0',
        deductionFromCollateralWorstCase > 0
          ? deductionFromCollateralWorstCase.toString()
          : '0',
        assetDecimals
      ),
      formattedValue: formatRange(
        deductionFromCollateralBestCase > 0
          ? deductionFromCollateralBestCase.toString()
          : '0',
        deductionFromCollateralWorstCase > 0
          ? deductionFromCollateralWorstCase.toString()
          : '0',
        assetDecimals,
        quantum
      ),
      symbol: assetSymbol,
      labelDescription: DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT(assetSymbol),
    });

    details.push({
      label: t('Projected margin'),
      value: formatRange(
        marginEstimate?.bestCase.initialLevel,
        marginEstimate?.worstCase.initialLevel,
        assetDecimals
      ),
      formattedValue: formatRange(
        marginEstimate?.bestCase.initialLevel,
        marginEstimate?.worstCase.initialLevel,
        assetDecimals,
        quantum
      ),
      symbol: assetSymbol,
      labelDescription: EST_TOTAL_MARGIN_TOOLTIP_TEXT,
    });
  }
  details.push({
    label: t('Current margin allocation'),
    value: formatValue(marginAccountBalance, assetDecimals),
    symbol: assetSymbol,
    labelDescription: MARGIN_ACCOUNT_TOOLTIP_TEXT,
    formattedValue: formatValue(marginAccountBalance, assetDecimals, quantum),
  });

  let liquidationPriceEstimate = emptyValue;
  let liquidationPriceEstimateFormatted;

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
    liquidationPriceEstimate = formatRange(
      (liquidationEstimateBestCase < liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      (liquidationEstimateBestCase > liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      assetDecimals
    );
    liquidationPriceEstimateFormatted = formatRange(
      (liquidationEstimateBestCase < liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      (liquidationEstimateBestCase > liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      assetDecimals,
      quantum
    );
  }

  details.push({
    label: t('Liquidation price estimate'),
    value: liquidationPriceEstimate,
    formattedValue: liquidationPriceEstimateFormatted,
    symbol: assetSymbol,
    labelDescription: LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  });
  return details;
};
