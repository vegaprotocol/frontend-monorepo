import { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FeesBreakdown } from '@vegaprotocol/markets';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';

import type { Market } from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import { AccountBreakdownDialog } from '@vegaprotocol/accounts';

import { formatRange, formatValue } from '@vegaprotocol/utils';
import { marketMarginDataProvider } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';

import {
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
} from '../../constants';
import { useEstimateFees } from '../../hooks';
import { KeyValue } from './key-value';

const emptyValue = '-';

export interface DealTicketFeeDetailsProps {
  assetSymbol: string;
  order: OrderSubmissionBody['orderSubmission'];
  market: Market;
}

export const DealTicketFeeDetails = ({
  assetSymbol,
  order,
  market,
}: DealTicketFeeDetailsProps) => {
  const feeEstimate = useEstimateFees(order);
  const { settlementAsset: asset } =
    market.tradableInstrument.instrument.product;
  const { decimals: assetDecimals, quantum } = asset;

  return (
    <KeyValue
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
  );
};

export interface DealTicketMarginDetailsProps {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  market: Market;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  assetSymbol: string;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
}

export const DealTicketMarginDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  market,
  onMarketClick,
  positionEstimate,
}: DealTicketMarginDetailsProps) => {
  const [breakdownDialog, setBreakdownDialog] = useState(false);
  const { pubKey: partyId } = useVegaWallet();
  const { data: currentMargins } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: { marketId: market.id, partyId: partyId || '' },
    skip: !partyId,
  });
  const liquidationEstimate = positionEstimate?.liquidation;
  const marginEstimate = positionEstimate?.margin;
  const totalBalance =
    BigInt(generalAccountBalance || '0') + BigInt(marginAccountBalance || '0');
  const { settlementAsset: asset } =
    market.tradableInstrument.instrument.product;
  const { decimals: assetDecimals, quantum } = asset;
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
      <KeyValue
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
      <KeyValue
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

    // The estimate order query API gives us the liquidation price in formatted by asset decimals.
    // We need to calculate it with asset decimals, but display it with market decimals precision until the API changes.
    liquidationPriceEstimate = formatRange(
      (liquidationEstimateBestCase < liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      (liquidationEstimateBestCase > liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      assetDecimals,
      undefined,
      market.decimalPlaces
    );
  }

  const onAccountBreakdownDialogClose = useCallback(
    () => setBreakdownDialog(false),
    []
  );

  const quoteName = market.tradableInstrument.instrument.product.quoteName;

  return (
    <>
      <KeyValue
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
      <KeyValue
        label={t('Total margin available')}
        indent
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
      <KeyValue
        label={t('Current margin allocation')}
        indent
        onClick={
          generalAccountBalance ? () => setBreakdownDialog(true) : undefined
        }
        value={formatValue(marginAccountBalance, assetDecimals)}
        symbol={assetSymbol}
        labelDescription={MARGIN_ACCOUNT_TOOLTIP_TEXT}
        formattedValue={formatValue(
          marginAccountBalance,
          assetDecimals,
          quantum
        )}
      />
      {projectedMargin}
      <KeyValue
        label={t('Liquidation price estimate')}
        value={liquidationPriceEstimate}
        formattedValue={liquidationPriceEstimate}
        symbol={quoteName}
        labelDescription={LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT}
      />
      {partyId && (
        <AccountBreakdownDialog
          assetId={breakdownDialog ? asset.id : undefined}
          partyId={partyId}
          onMarketClick={onMarketClick}
          onClose={onAccountBreakdownDialogClose}
        />
      )}
    </>
  );
};
