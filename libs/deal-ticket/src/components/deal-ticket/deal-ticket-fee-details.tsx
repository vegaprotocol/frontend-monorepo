import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FeesBreakdown } from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet';

import type { Market } from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import type { EstimateFeesQuery } from '../../hooks/__generated__/EstimateOrder';

import {
  addDecimalsFormatNumber,
  isNumeric,
  addDecimalsFormatNumberQuantum,
} from '@vegaprotocol/utils';
import { marketMarginDataProvider } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';

import {
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
} from '../../constants';

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
export interface DealTicketFeeDetailPros {
  label: string;
  value?: string | null | undefined;
  symbol: string;
  indent?: boolean | undefined;
  labelDescription?: ReactNode;
  formattedValue?: string;
}

export const DealTicketFeeDetail = ({
  label,
  value,
  labelDescription,
  symbol,
  indent,
  formattedValue,
}: DealTicketFeeDetailPros) => (
  <div
    data-testid={
      'deal-ticket-fee-' + label.toLocaleLowerCase().replace(/\s/g, '-')
    }
    key={typeof label === 'string' ? label : 'value-dropdown'}
    className={classnames(
      'text-xs mt-2 flex justify-between items-center gap-4 flex-wrap',
      { 'ml-2': indent }
    )}
  >
    <div>
      <Tooltip description={labelDescription}>
        <div>{label}</div>
      </Tooltip>
    </div>
    <Tooltip description={`${value ?? '-'} ${symbol || ''}`}>
      <div className="text-neutral-500 dark:text-neutral-300">{`${
        formattedValue ?? '-'
      } ${symbol || ''}`}</div>
    </Tooltip>
  </div>
);

export interface DealTicketFeeDetailsProps {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  market: Market;
  assetSymbol: string;
  notionalSize: string | null;
  feeEstimate: EstimateFeesQuery['estimateFees'] | undefined;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
}

export const DealTicketFeeDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  feeEstimate,
  market,
  notionalSize,
  positionEstimate,
}: DealTicketFeeDetailsProps) => {
  const { pubKey } = useVegaWallet();
  const { data: currentMargins } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: { marketId: market.id, partyId: pubKey || '' },
    skip: !pubKey,
  });
  const liquidationEstimate = positionEstimate?.liquidation;
  const marginEstimate = positionEstimate?.margin;
  const totalBalance =
    BigInt(generalAccountBalance || '0') + BigInt(marginAccountBalance || '0');
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  const quantum =
    market.tradableInstrument.instrument.product.settlementAsset.quantum;
  let marginRequiredBestCase: string | undefined = undefined;
  let marginRequiredWorstCase: string | undefined = undefined;
  if (marginEstimate) {
    if (currentMargins) {
      marginRequiredBestCase = (
        BigInt(marginEstimate.bestCase.initialLevel) -
        BigInt(currentMargins.initialLevel)
      ).toString();
      if (marginRequiredBestCase.startsWith('-')) {
        marginRequiredBestCase = '0';
      }
      marginRequiredWorstCase = (
        BigInt(marginEstimate.worstCase.initialLevel) -
        BigInt(currentMargins.initialLevel)
      ).toString();
      if (marginRequiredWorstCase.startsWith('-')) {
        marginRequiredWorstCase = '0';
      }
    } else {
      marginRequiredBestCase = marginEstimate.bestCase.initialLevel;
      marginRequiredWorstCase = marginEstimate.worstCase.initialLevel;
    }
  }

  const totalMarginAvailable = (
    currentMargins
      ? totalBalance - BigInt(currentMargins.maintenanceLevel)
      : totalBalance
  ).toString();

  let deductionFromCollateral = null;
  let projectedMargin = null;
  if (marginAccountBalance) {
    const deductionFromCollateralBestCase =
      BigInt(marginEstimate?.bestCase.initialLevel ?? 0) -
      BigInt(marginAccountBalance);

    const deductionFromCollateralWorstCase =
      BigInt(marginEstimate?.worstCase.initialLevel ?? 0) -
      BigInt(marginAccountBalance);

    deductionFromCollateral = (
      <DealTicketFeeDetail
        indent
        label={t('Deduction from collateral')}
        value={formatRange(
          deductionFromCollateralBestCase > 0
            ? deductionFromCollateralBestCase.toString()
            : '0',
          deductionFromCollateralWorstCase > 0
            ? deductionFromCollateralWorstCase.toString()
            : '0',
          assetDecimals
        )}
        formattedValue={formatRange(
          deductionFromCollateralBestCase > 0
            ? deductionFromCollateralBestCase.toString()
            : '0',
          deductionFromCollateralWorstCase > 0
            ? deductionFromCollateralWorstCase.toString()
            : '0',
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
        labelDescription={DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT(assetSymbol)}
      />
    );
    projectedMargin = (
      <DealTicketFeeDetail
        indent
        label={t('Projected margin')}
        value={formatRange(
          marginEstimate?.bestCase.initialLevel,
          marginEstimate?.worstCase.initialLevel,
          assetDecimals
        )}
        formattedValue={formatRange(
          marginEstimate?.bestCase.initialLevel,
          marginEstimate?.worstCase.initialLevel,
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
        labelDescription={EST_TOTAL_MARGIN_TOOLTIP_TEXT}
      />
    );
  }

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

  return (
    <div>
      <DealTicketFeeDetail
        label={t('Notional')}
        value={formatValue(notionalSize, assetDecimals)}
        formattedValue={formatValue(notionalSize, assetDecimals, quantum)}
        symbol={assetSymbol}
        labelDescription={NOTIONAL_SIZE_TOOLTIP_TEXT(assetSymbol)}
      />
      <DealTicketFeeDetail
        label={t('Fees')}
        value={
          feeEstimate?.totalFeeAmount &&
          `~${formatValue(feeEstimate?.totalFeeAmount, assetDecimals)}`
        }
        formattedValue={
          feeEstimate?.totalFeeAmount &&
          `~${formatValue(feeEstimate?.totalFeeAmount, assetDecimals, quantum)}`
        }
        labelDescription={
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
        }
        symbol={assetSymbol}
      />
      <DealTicketFeeDetail
        label={t('Margin required')}
        value={formatRange(
          marginRequiredBestCase,
          marginRequiredWorstCase,
          assetDecimals
        )}
        formattedValue={formatRange(
          marginRequiredBestCase,
          marginRequiredWorstCase,
          assetDecimals,
          quantum
        )}
        labelDescription={MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol)}
        symbol={assetSymbol}
      />
      <DealTicketFeeDetail
        label={t('Total margin available')}
        value={formatValue(totalMarginAvailable, assetDecimals)}
        formattedValue={formatValue(
          totalMarginAvailable,
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
        labelDescription={TOTAL_MARGIN_AVAILABLE(
          formatValue(generalAccountBalance, assetDecimals, quantum),
          formatValue(marginAccountBalance, assetDecimals, quantum),
          formatValue(currentMargins?.maintenanceLevel, assetDecimals, quantum),
          assetSymbol
        )}
      />
      {deductionFromCollateral}
      {projectedMargin}
      <DealTicketFeeDetail
        label={t('Current margin allocation')}
        value={formatValue(marginAccountBalance, assetDecimals)}
        symbol={assetSymbol}
        labelDescription={MARGIN_ACCOUNT_TOOLTIP_TEXT}
        formattedValue={formatValue(
          marginAccountBalance,
          assetDecimals,
          quantum
        )}
      />
      <DealTicketFeeDetail
        label={t('Liquidation price estimate')}
        value={liquidationPriceEstimate}
        formattedValue={liquidationPriceEstimateFormatted}
        symbol={assetSymbol}
        labelDescription={LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT}
      />
    </div>
  );
};
