import { getAsset } from '@vegaprotocol/markets';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { Market } from '@vegaprotocol/markets';
import { formatNumberPercentage, formatValue } from '@vegaprotocol/utils';
import { useEstimateFees } from '../../hooks/use-estimate-fees';
import { KeyValue } from './key-value';
import { Intent, Pill } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { FeesBreakdown } from '../fees-breakdown';
import { getTotalDiscountFactor, getDiscountedFee } from '../discounts';
import { useT } from '../../use-t';

export const emptyValue = '-';

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
  const t = useT();
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
      label={
        <>
          <span data-testid="fees-text">{t('Fees')}</span>
          {totalDiscountFactor !== '0' ? (
            <Pill
              size="xxs"
              intent={Intent.Info}
              className="ml-1"
              data-testid="discount-pill"
            >
              {formatNumberPercentage(
                new BigNumber(totalDiscountFactor).multipliedBy(100)
              )}
            </Pill>
          ) : null}
        </>
      }
      value={
        totalDiscountedFeeAmount &&
        `~${formatValue(totalDiscountedFeeAmount, assetDecimals)}`
      }
      formattedValue={
        totalDiscountedFeeAmount &&
        `~${formatValue(totalDiscountedFeeAmount, assetDecimals, quantum)}`
      }
      labelDescription={
        <div className="flex flex-col gap-2">
          <p>
            {t(
              'An estimate of the most you would be expected to pay in fees, in the market\'s settlement asset {{assetSymbol}}. Fees estimated are "taker" fees and will only be payable if the order trades aggressively. Rebate equal to the maker portion will be paid to the trader if the order trades passively.',
              { assetSymbol }
            )}
          </p>
          <FeesBreakdown
            feeEstimate={feeEstimate}
            feeFactors={market.fees.factors}
            symbol={assetSymbol}
            decimals={assetDecimals}
          />
        </div>
      }
      symbol={assetSymbol}
    />
  );
};
