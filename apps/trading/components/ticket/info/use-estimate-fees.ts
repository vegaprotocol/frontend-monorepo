import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  isMarketInAuction,
  useMarkPrice,
  useMarketTradingMode,
} from '@vegaprotocol/markets';
import { OrderType } from '@vegaprotocol/types';
import { removeDecimal } from '@vegaprotocol/utils';

import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

import {
  type EstimateFeesQueryVariables,
  useEstimateFeesQuery,
} from '../__generated__/EstimateFees';
import { getDiscountedFee } from '../utils';
import BigNumber from 'bignumber.js';

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

  // Post only orders won't have fees as its the taker who pays
  if (postOnly) {
    return {
      fee: '0',
      feeDiscounted: '0',
      discount: '0',
      discountPct: '0',
      makerRebate: '0',
      makerRebatePct: '0',
    };
  }

  const atEpoch = (Number(data?.epoch.id) || 0) - 1;

  const volumeDiscountFactor =
    (data?.volumeDiscountStats.edges[0]?.node.atEpoch === atEpoch &&
      data?.volumeDiscountStats.edges[0]?.node.discountFactor) ||
    '0';
  const referralDiscountFactor =
    (data?.referralSetStats.edges[0]?.node.atEpoch === atEpoch &&
      data?.referralSetStats.edges[0]?.node.discountFactor) ||
    '0';

  let fee = data?.estimateFees.totalFeeAmount || '0';
  const makerRebate = data?.estimateFees.fees.highVolumeMakerFee || '0';

  // In auction the fee is shared 50/50 between the maker and the taker
  // so divide it by 2 for a more accurate estimate
  if (isAuction) {
    fee = (BigInt(fee) / BigInt(2)).toString();
  }

  const { totalDiscount, discountedFee } = getDiscountedFee(
    fee,
    referralDiscountFactor,
    volumeDiscountFactor
  );

  const hasFee = fee && fee !== '0';

  return {
    fee,
    feeDiscounted: discountedFee,
    discount: totalDiscount,
    discountPct: hasFee
      ? BigNumber(fee).minus(discountedFee).div(fee).times(100).toString()
      : '0',
    makerRebate,
    makerRebatePct: hasFee
      ? BigNumber(makerRebate).div(fee).times(100).toString()
      : '0',
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
