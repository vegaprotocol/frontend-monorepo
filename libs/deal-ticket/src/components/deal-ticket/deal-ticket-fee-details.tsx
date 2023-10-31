import { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';

import type { Market } from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import { AccountBreakdownDialog } from '@vegaprotocol/accounts';

import {
  formatNumberPercentage,
  formatRange,
  formatValue,
} from '@vegaprotocol/utils';
import { marketMarginDataProvider } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as Schema from '@vegaprotocol/types';

import {
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
} from '../../constants';
import { useEstimateFees } from '../../hooks/use-estimate-fees';
import { KeyValue } from './key-value';
import {
  Accordion,
  AccordionChevron,
  AccordionPanel,
  Intent,
  ExternalLink,
  Pill,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import { FeesBreakdown } from '../fees-breakdown';
import { getTotalDiscountFactor, getDiscountedFee } from '../discounts';

const emptyValue = '-';

export interface DealTicketFeeDetailsProps {
  assetSymbol: string;
  order: OrderSubmissionBody['orderSubmission'];
  market: Market;
  isMarketInAuction?: boolean;
}

export const DealTicketFeeDetails = ({
  assetSymbol,
  order,
  market,
  isMarketInAuction,
}: DealTicketFeeDetailsProps) => {
  const feeEstimate = useEstimateFees(order, isMarketInAuction);
  const asset = getAsset(market);
  const { decimals: assetDecimals, quantum } = asset;

  const totalDiscountFactor = getTotalDiscountFactor(feeEstimate);
  const totalDiscountedFeeAmount =
    feeEstimate?.totalFeeAmount &&
    getDiscountedFee(
      feeEstimate.totalFeeAmount,
      feeEstimate.referralDiscountFactor,
      feeEstimate.volumeDiscountFactor
    ).discountedFee;

  return (
    <KeyValue
      label={t('Fees')}
      value={
        totalDiscountedFeeAmount &&
        `~${formatValue(totalDiscountedFeeAmount, assetDecimals)}`
      }
      formattedValue={
        <>
          {totalDiscountFactor && (
            <Pill size="xxs" intent={Intent.Warning} className="mr-1">
              -
              {formatNumberPercentage(
                new BigNumber(totalDiscountFactor).multipliedBy(100),
                2
              )}
            </Pill>
          )}
          {totalDiscountedFeeAmount &&
            `~${formatValue(totalDiscountedFeeAmount, assetDecimals, quantum)}`}
        </>
      }
      labelDescription={
        <>
          <p className="mb-2">
            {t(
              `An estimate of the most you would be expected to pay in fees, in the market's settlement asset ${assetSymbol}. Fees estimated are "taker" fees and will only be payable if the order trades aggressively. Rebate equal to the maker portion will be paid to the trader if the order trades passively.`
            )}
          </p>
          <FeesBreakdown
            totalFeeAmount={feeEstimate?.totalFeeAmount}
            referralDiscountFactor={feeEstimate?.referralDiscountFactor}
            volumeDiscountFactor={feeEstimate?.volumeDiscountFactor}
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
  side: Schema.Side;
}

export const DealTicketMarginDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  market,
  onMarketClick,
  positionEstimate,
  side,
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
  const asset = getAsset(market);
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
        formattedValue={formatValue(
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
        formattedValue={formatValue(
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
  let liquidationPriceEstimateRange = emptyValue;

  if (liquidationEstimate) {
    const liquidationEstimateBestCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.bestCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCaseIncludingSellOrders = BigInt(
      liquidationEstimate.bestCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCase =
      side === Schema.Side.SIDE_BUY
        ? liquidationEstimateBestCaseIncludingBuyOrders
        : liquidationEstimateBestCaseIncludingSellOrders;

    const liquidationEstimateWorstCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.worstCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCaseIncludingSellOrders = BigInt(
      liquidationEstimate.worstCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCase =
      side === Schema.Side.SIDE_BUY
        ? liquidationEstimateWorstCaseIncludingBuyOrders
        : liquidationEstimateWorstCaseIncludingSellOrders;

    liquidationPriceEstimate = formatValue(
      liquidationEstimateWorstCase.toString(),
      market.decimalPlaces,
      undefined,
      market.decimalPlaces
    );
    liquidationPriceEstimateRange = formatRange(
      (liquidationEstimateBestCase < liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      (liquidationEstimateBestCase > liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      market.decimalPlaces,
      undefined,
      market.decimalPlaces
    );
  }

  const onAccountBreakdownDialogClose = useCallback(
    () => setBreakdownDialog(false),
    []
  );

  const quoteName = getQuoteName(market);

  return (
    <div className="flex flex-col w-full gap-2">
      <Accordion>
        <AccordionPanel
          itemId="margin"
          trigger={
            <AccordionPrimitive.Trigger
              data-testid="accordion-toggle"
              className={classNames(
                'w-full pt-2',
                'flex items-center gap-2 text-xs',
                'group'
              )}
            >
              <div
                data-testid={`deal-ticket-fee-margin-required`}
                key={'value-dropdown'}
                className="flex items-center justify-between w-full gap-2"
              >
                <div className="flex items-center text-left gap-1">
                  <Tooltip description={MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol)}>
                    <span className="text-muted">{t('Margin required')}</span>
                  </Tooltip>

                  <AccordionChevron size={10} />
                </div>
                <Tooltip
                  description={
                    formatRange(
                      marginRequiredBestCase,
                      marginRequiredWorstCase,
                      assetDecimals
                    ) ?? '-'
                  }
                >
                  <div className="font-mono text-right">
                    {formatValue(
                      marginRequiredWorstCase,
                      assetDecimals,
                      quantum
                    )}{' '}
                    {assetSymbol || ''}
                  </div>
                </Tooltip>
              </div>
            </AccordionPrimitive.Trigger>
          }
        >
          <div className="flex flex-col w-full gap-2">
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
                formatValue(
                  currentMargins?.maintenanceLevel,
                  assetDecimals,
                  quantum
                ),
                assetSymbol
              )}
            />
            {deductionFromCollateral}
            <KeyValue
              label={t('Current margin allocation')}
              indent
              onClick={
                generalAccountBalance
                  ? () => setBreakdownDialog(true)
                  : undefined
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
          </div>
        </AccordionPanel>
      </Accordion>
      {projectedMargin}
      <KeyValue
        label={t('Liquidation')}
        value={liquidationPriceEstimateRange}
        formattedValue={liquidationPriceEstimate}
        symbol={quoteName}
        labelDescription={
          <>
            <span>{LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT}</span>{' '}
            <span>
              {t('For full details please see ')}
              <ExternalLink
                href={
                  'https://github.com/vegaprotocol/specs/blob/master/non-protocol-specs/0012-NP-LIPE-liquidation-price-estimate.md'
                }
              >
                {t('liquidation price estimate documentation.')}
              </ExternalLink>
            </span>
          </>
        }
      />
      {partyId && (
        <AccountBreakdownDialog
          assetId={breakdownDialog ? asset.id : undefined}
          partyId={partyId}
          onMarketClick={onMarketClick}
          onClose={onAccountBreakdownDialogClose}
        />
      )}
    </div>
  );
};
