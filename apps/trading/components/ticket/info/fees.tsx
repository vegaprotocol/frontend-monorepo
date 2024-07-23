import BigNumber from 'bignumber.js';

import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  isMarketInAuction,
  useMarkPrice,
  useMarketTradingMode,
} from '@vegaprotocol/markets';
import { OrderType } from '@vegaprotocol/types';
import {
  formatNumberPercentage,
  formatValue,
  removeDecimal,
} from '@vegaprotocol/utils';
import { Intent, Pill, Tooltip } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';
import { DatagridRow } from '../elements/datagrid';

import { FeesBreakdown } from './fees-breakdown';
import { useEstimateFeesQuery } from '../__generated__/EstimateFees';
import * as utils from '../utils';

export const Fees = () => {
  const t = useT();
  const feeEstimate = useEstimateFees();
  const ticket = useTicketContext();
  const asset = ticket.quoteAsset;

  const totalDiscountFactor = utils.getTotalDiscountFactor(feeEstimate);
  const totalDiscountedFeeAmount =
    feeEstimate?.totalFeeAmount &&
    utils.getDiscountedFee(
      feeEstimate.totalFeeAmount,
      feeEstimate.referralDiscountFactor,
      feeEstimate.volumeDiscountFactor
    ).discountedFee;

  return (
    <DatagridRow
      label={
        <Tooltip
          description={
            <div className="flex flex-col gap-2">
              <p>
                {t(
                  'An estimate of the most you would be expected to pay in fees, in the market\'s settlement asset {{assetSymbol}}. Fees estimated are "taker" fees and will only be payable if the order trades aggressively. Rebate equal to the maker portion will be paid to the trader if the order trades passively.',
                  { assetSymbol: asset.symbol }
                )}
              </p>
              <FeesBreakdown
                feeEstimate={feeEstimate}
                feeFactors={ticket.market.fees.factors}
                symbol={asset.symbol}
                decimals={asset.decimals}
              />
            </div>
          }
        >
          <span>
            <span data-testid="fees-text">
              {t('Fees ({{symbol}})', {
                symbol: asset.symbol,
              })}
            </span>
            {totalDiscountFactor !== '0' && (
              <Pill
                size="xxs"
                intent={Intent.Info}
                className="ml-1"
                data-testid="discount-pill"
              >
                {formatNumberPercentage(
                  BigNumber(totalDiscountFactor).multipliedBy(100)
                )}
              </Pill>
            )}
          </span>
        </Tooltip>
      }
      value={
        totalDiscountedFeeAmount ? (
          <Tooltip
            description={`~${formatValue(
              totalDiscountedFeeAmount,
              asset.decimals
            )}`}
          >
            <span>{`~${formatValue(
              totalDiscountedFeeAmount,
              asset.decimals,
              asset.quantum
            )}`}</span>
          </Tooltip>
        ) : (
          '-'
        )
      }
    />
  );
};

export const useEstimateFees = () => {
  const ticket = useTicketContext();
  const form = useForm();
  const { pubKey } = useVegaWallet();
  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);
  const isAuction = marketTradingMode
    ? isMarketInAuction(marketTradingMode)
    : false;

  const values = form.watch();

  const price =
    values.type === OrderType.TYPE_LIMIT
      ? removeDecimal(
          values.price?.toString() || '0',
          ticket.market.decimalPlaces
        )
      : removeDecimal(markPrice || '0', ticket.market.decimalPlaces);

  const { data } = useEstimateFeesQuery({
    variables: {
      marketId: ticket.market.id,
      partyId: pubKey || '',
      type: values.type,
      price,
      size: removeDecimal(
        values.size?.toString() || '0',
        ticket.market.positionDecimalPlaces
      ),
      side: values.side,
      timeInForce: values.timeInForce,
    },
    skip: !pubKey || !values.size || !price,
    fetchPolicy: 'cache-and-network',
  });

  const atEpoch = (Number(data?.epoch.id) || 0) - 1;

  const volumeDiscountFactor =
    (data?.volumeDiscountStats.edges[0]?.node.atEpoch === atEpoch &&
      data?.volumeDiscountStats.edges[0]?.node.discountFactor) ||
    '0';
  const referralDiscountFactor =
    (data?.referralSetStats.edges[0]?.node.atEpoch === atEpoch &&
      data?.referralSetStats.edges[0]?.node.discountFactor) ||
    '0';

  if (!data?.estimateFees) return undefined;

  // Post only orders won't have fees as its the taker who pays
  if (
    (values.ticketType === 'stopLimit' || values.ticketType === 'limit') &&
    values.postOnly
  ) {
    return {
      volumeDiscountFactor,
      referralDiscountFactor,
      totalFeeAmount: '0',
      fees: {
        infrastructureFee: '0',
        liquidityFee: '0',
        makerFee: '0',
      },
    };
  }

  if (isAuction) {
    return {
      volumeDiscountFactor,
      referralDiscountFactor,
      totalFeeAmount: divideByTwo(data.estimateFees.totalFeeAmount),
      fees: {
        infrastructureFee: divideByTwo(
          data.estimateFees.fees.infrastructureFee
        ),
        liquidityFee: divideByTwo(data.estimateFees.fees.liquidityFee),
        makerFee: divideByTwo(data.estimateFees.fees.makerFee),
        infrastructureFeeReferralDiscount:
          data.estimateFees.fees.infrastructureFeeReferralDiscount &&
          divideByTwo(data.estimateFees.fees.infrastructureFeeReferralDiscount),
        infrastructureFeeVolumeDiscount:
          data.estimateFees.fees.infrastructureFeeVolumeDiscount &&
          divideByTwo(data.estimateFees.fees.infrastructureFeeVolumeDiscount),
        liquidityFeeReferralDiscount:
          data.estimateFees.fees.liquidityFeeReferralDiscount &&
          divideByTwo(data.estimateFees.fees.liquidityFeeReferralDiscount),
        liquidityFeeVolumeDiscount:
          data.estimateFees.fees.liquidityFeeVolumeDiscount &&
          divideByTwo(data.estimateFees.fees.liquidityFeeVolumeDiscount),
        makerFeeReferralDiscount:
          data.estimateFees.fees.makerFeeReferralDiscount &&
          divideByTwo(data.estimateFees.fees.makerFeeReferralDiscount),
        makerFeeVolumeDiscount:
          data.estimateFees.fees.makerFeeVolumeDiscount &&
          divideByTwo(data.estimateFees.fees.makerFeeVolumeDiscount),
      },
    };
  }

  return {
    volumeDiscountFactor,
    referralDiscountFactor,
    ...data.estimateFees,
  };
};

const divideByTwo = (n: string) => (BigInt(n) / BigInt(2)).toString();
