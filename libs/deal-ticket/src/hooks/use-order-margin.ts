import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { Schema } from '@vegaprotocol/types';
import { removeDecimal } from '@vegaprotocol/react-helpers';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { useMarketPositions } from './use-market-positions';
import type { EstimateOrderQuery } from './__generated__/EstimateOrder';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';
import { isMarketInAuction } from '../utils';

interface Props {
  order: OrderSubmissionBody['orderSubmission'];
  market: MarketDealTicket;
  partyId: string;
}

const addFees = (feeObj: EstimateOrderQuery['estimateOrder']['fee']) => {
  return new BigNumber(feeObj.makerFee)
    .plus(feeObj.liquidityFee)
    .plus(feeObj.infrastructureFee);
};

export interface OrderMargin {
  margin: string;
  totalFees: string | null;
  fees: {
    makerFee: string;
    liquidityFee: string;
    infrastructureFee: string;
  };
}

export const useOrderMargin = ({
  order,
  market,
  partyId,
}: Props): OrderMargin | null => {
  const marketPositions = useMarketPositions({ marketId: market.id, partyId });
  const priceForEstimate = getPriceForEstimate(order, market);

  const { data } = useEstimateOrderQuery({
    variables: {
      marketId: market.id,
      partyId,
      price: priceForEstimate,
      size: removeDecimal(order.size, market.positionDecimalPlaces),
      side: order.side,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    skip: !partyId || !market.id || !order.size || !priceForEstimate,
  });

  if (data?.estimateOrder.marginLevels.initialLevel) {
    const fees =
      data?.estimateOrder?.fee && addFees(data.estimateOrder.fee).toString();
    const margin = BigNumber.maximum(
      0,
      new BigNumber(data.estimateOrder.marginLevels.initialLevel).minus(
        marketPositions?.balance || 0
      )
    ).toString();

    const { makerFee, liquidityFee, infrastructureFee } =
      data.estimateOrder.fee;

    return {
      margin,
      totalFees: fees,
      fees: {
        makerFee,
        liquidityFee,
        infrastructureFee,
      },
    };
  }
  return null;
};

/**
 * Gets a price to use for estimating order margin and fees.
 * Market orders should use the markPrice or if in auction mode
 * the indicative price. If its a limit order use user input price.
 */
const getPriceForEstimate = (
  order: {
    type: Schema.OrderType;
    price?: string | undefined;
  },
  market: MarketDealTicket
) => {
  // If order type is market we should use either the mark price
  // or the uncrossing price. If order type is limit use the price
  // the user has input
  let price;
  if (order.type === Schema.OrderType.TYPE_LIMIT && order.price) {
    price = removeDecimal(order.price, market.decimalPlaces);
  } else {
    if (isMarketInAuction(market)) {
      price = market.data.indicativePrice;
    } else {
      price = market.data.markPrice;
    }
  }

  return price === '0' ? undefined : price;
};
