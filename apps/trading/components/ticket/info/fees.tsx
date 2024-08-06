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
import {
  type EstimateFeesQueryVariables,
  useEstimateFeesQuery,
} from '../__generated__/EstimateFees';
import * as utils from '../utils';

export const Fees = ({ oco = false }: { oco?: boolean }) => {
  const t = useT();
  const feeEstimate = useEstimateFees(oco);
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

export const useEstimateFees = (oco: boolean) => {
  const form = useForm();
  const ticket = useTicketContext();

  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);
  const isAuction = marketTradingMode
    ? isMarketInAuction(marketTradingMode)
    : false;

  const postOnly = form.watch('postOnly');

  const variables = useEstimateFeesQueryVariables(oco, markPrice);

  const { data } = useEstimateFeesQuery({
    variables,
    skip: postOnly || !variables.partyId || !variables.size || !variables.price,
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
  if (postOnly) {
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

const useEstimateFeesQueryVariables = (
  oco: boolean,
  markPrice: string | null
): EstimateFeesQueryVariables => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext();
  const form = useForm();
  const values = form.watch();
  const positionDp = ticket.market.positionDecimalPlaces;
  const marketDp = ticket.market.decimalPlaces;

  const commonVariables = {
    marketId: ticket.market.id,
    partyId: pubKey || '',
    type: values.type,
    side: values.side,
    timeInForce: values.timeInForce,
  };

  if (values.ticketType === 'market') {
    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString(), positionDp),
      price: markPrice,
    };
  }

  if (values.ticketType === 'limit') {
    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString(), positionDp),
      price: removeDecimal(values.price?.toString(), marketDp),
    };
  }

  if (values.ticketType === 'stopMarket') {
    // Use the trigger price as the order will
    // submit at that price, so it will be more accurate
    // to use the price then rather than any current price
    const price =
      values.ocoTriggerType === 'price'
        ? removeDecimal(values.triggerPrice?.toString(), marketDp)
        : markPrice;

    if (oco) {
      if (!values.ocoTimeInForce) {
        throw new Error('ocoTimeInForce required for fees estimate');
      }

      return {
        ...commonVariables,
        type: OrderType.TYPE_MARKET,
        size: removeDecimal(values.ocoSize?.toString() || '0', positionDp),
        price,
        timeInForce: values.ocoTimeInForce,
      };
    }

    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString() || '0', positionDp),
      price,
    };
  }

  if (values.ticketType === 'stopLimit') {
    if (oco) {
      if (!values.ocoTimeInForce) {
        throw new Error('ocoTimeInForce required for fees estimate');
      }

      return {
        ...commonVariables,
        type: OrderType.TYPE_LIMIT,
        size: removeDecimal(values.ocoSize?.toString() || '0', positionDp),
        price: removeDecimal(values.ocoPrice?.toString() || '0', marketDp),
        timeInForce: values.ocoTimeInForce,
      };
    }

    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString() || '0', positionDp),
      price: removeDecimal(values.price?.toString(), marketDp),
    };
  }

  throw new Error('invalid ticketType');
};

const divideByTwo = (n: string) => (BigInt(n) / BigInt(2)).toString();
