import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { removeDecimal } from '@vegaprotocol/react-helpers';
import { useMarketPositions } from './use-market-positions';
import type { EstimateOrderQuery } from './__generated__/EstimateOrder';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';
import type { MarketDealTicket } from '@vegaprotocol/market-list';

export interface Props {
  order: OrderSubmissionBody['orderSubmission'];
  market: MarketDealTicket;
  partyId: string;
  derivedPrice?: string;
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
  derivedPrice,
}: Props): OrderMargin | null => {
  const marketPositions = useMarketPositions({ marketId: market.id, partyId });

  const { data } = useEstimateOrderQuery({
    variables: {
      marketId: market.id,
      partyId,
      price: derivedPrice,
      size: removeDecimal(order.size, market.positionDecimalPlaces),
      side: order.side,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    skip: !partyId || !market.id || !order.size || !derivedPrice,
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
