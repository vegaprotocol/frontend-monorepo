import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { Schema } from '@vegaprotocol/types';
import { addDecimal, removeDecimal } from '@vegaprotocol/react-helpers';
import { useMarketPositions } from './use-market-positions';
import { useMarketDataMarkPrice } from './use-market-data-mark-price';
import type { EstimateOrderQuery } from './__generated__/EstimateOrder';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';
import type { DealTicketMarketFragment } from '../components/deal-ticket/__generated___/DealTicket';

interface Props {
  order: OrderSubmissionBody['orderSubmission'];
  market: DealTicketMarketFragment;
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
  const markPriceData = useMarketDataMarkPrice(market.id);
  const { data } = useEstimateOrderQuery({
    variables: {
      marketId: market.id,
      partyId,
      price: order.price
        ? removeDecimal(order.price, market.decimalPlaces)
        : markPriceData?.market?.data?.markPrice || '',
      size: removeDecimal(
        BigNumber.maximum(
          0,
          new BigNumber(marketPositions?.openVolume || 0)
            [order.side === Schema.Side.SIDE_BUY ? 'plus' : 'minus'](order.size)
            .absoluteValue()
        ).toString(),
        market.positionDecimalPlaces
      ),
      side:
        order.side === Schema.Side.SIDE_BUY
          ? Schema.Side.SIDE_BUY
          : Schema.Side.SIDE_SELL,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    skip:
      !partyId ||
      !market.id ||
      !order.size ||
      !markPriceData?.market?.data?.markPrice,
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
      margin: addDecimal(margin, market.decimalPlaces),
      totalFees: addDecimal(fees, market.decimalPlaces),
      fees: {
        makerFee: addDecimal(makerFee, market.decimalPlaces),
        liquidityFee: addDecimal(liquidityFee, market.decimalPlaces),
        infrastructureFee: addDecimal(infrastructureFee, market.decimalPlaces),
      },
    };
  }
  return null;
};
