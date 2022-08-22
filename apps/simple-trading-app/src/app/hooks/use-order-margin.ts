import { BigNumber } from 'bignumber.js';
import type { Order } from '@vegaprotocol/orders';
import { gql, useQuery } from '@apollo/client';
import type {
  EstimateOrder,
  EstimateOrderVariables,
  EstimateOrder_estimateOrder_fee,
} from './__generated__/estimateOrder';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import { Side } from '@vegaprotocol/types';
import { addDecimal, removeDecimal } from '@vegaprotocol/react-helpers';
import useMarketPositions from './use-market-positions';
import useMarketData from './use-market-data';

export const ESTIMATE_ORDER_QUERY = gql`
  query EstimateOrder(
    $marketId: ID!
    $partyId: ID!
    $price: String
    $size: String!
    $side: Side!
    $timeInForce: OrderTimeInForce!
    $expiration: String
    $type: OrderType!
  ) {
    estimateOrder(
      marketId: $marketId
      partyId: $partyId
      price: $price
      size: $size
      side: $side
      timeInForce: $timeInForce
      expiration: $expiration
      type: $type
    ) {
      fee {
        makerFee
        infrastructureFee
        liquidityFee
      }
      marginLevels {
        initialLevel
      }
    }
  }
`;

interface Props {
  order: Order;
  market: DealTicketQuery_market;
  partyId: string;
}

const addFees = (feeObj: EstimateOrder_estimateOrder_fee) => {
  return new BigNumber(feeObj.makerFee)
    .plus(feeObj.liquidityFee)
    .plus(feeObj.infrastructureFee);
};

export interface OrderMargin {
  margin: string;
  fees: string | null;
}

const useOrderMargin = ({
  order,
  market,
  partyId,
}: Props): OrderMargin | null => {
  const marketPositions = useMarketPositions({ marketId: market.id, partyId });
  const markPriceData = useMarketData(market.id);
  const { data } = useQuery<EstimateOrder, EstimateOrderVariables>(
    ESTIMATE_ORDER_QUERY,
    {
      variables: {
        marketId: market.id,
        partyId,
        price: markPriceData?.market?.data?.markPrice || '',
        size: removeDecimal(
          BigNumber.maximum(
            0,
            new BigNumber(marketPositions?.openVolume || 0)[
              order.side === Side.SIDE_BUY ? 'plus' : 'minus'
            ](order.size)
          ).toString(),
          market.positionDecimalPlaces
        ),
        side: order.side === Side.SIDE_BUY ? Side.SIDE_BUY : Side.SIDE_SELL,
        timeInForce: order.timeInForce,
        type: order.type,
      },
      skip:
        !partyId ||
        !market.id ||
        !order.size ||
        !markPriceData?.market?.data?.markPrice,
    }
  );

  if (data?.estimateOrder.marginLevels.initialLevel) {
    const fees =
      data?.estimateOrder?.fee && addFees(data.estimateOrder.fee).toString();
    return {
      margin: addDecimal(
        BigNumber.maximum(
          0,
          new BigNumber(data.estimateOrder.marginLevels.initialLevel).minus(
            marketPositions?.balance || 0
          )
        ).toString(),
        market.decimalPlaces
      ),
      fees: addDecimal(fees, market.decimalPlaces),
    };
  }
  return null;
};

export default useOrderMargin;
