import { BigNumber } from 'bignumber.js';
import type { Order } from '@vegaprotocol/orders';
import { gql, useQuery } from '@apollo/client';
import type {
  EstimateOrder,
  EstimateOrderVariables,
} from './__generated__/estimateOrder';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import {
  VegaWalletOrderSide,
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
} from '@vegaprotocol/wallet';
import { addDecimal } from '@vegaprotocol/react-helpers';
import useMarketPositions from './use-market-positions';

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
      totalFeeAmount
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

const times: Record<VegaWalletOrderTimeInForce, OrderTimeInForce> = {
  [VegaWalletOrderTimeInForce.GTC]: OrderTimeInForce.GTC,
  [VegaWalletOrderTimeInForce.GTT]: OrderTimeInForce.GTT,
  [VegaWalletOrderTimeInForce.IOC]: OrderTimeInForce.IOC,
  [VegaWalletOrderTimeInForce.FOK]: OrderTimeInForce.FOK,
  [VegaWalletOrderTimeInForce.GFN]: OrderTimeInForce.GFN,
  [VegaWalletOrderTimeInForce.GFA]: OrderTimeInForce.GFA,
};

const types: Record<VegaWalletOrderType, OrderType> = {
  [VegaWalletOrderType.Market]: OrderType.Market,
  [VegaWalletOrderType.Limit]: OrderType.Limit,
};

const useOrderMargin = ({ order, market, partyId }: Props) => {
  const marketPositions = useMarketPositions({ marketId: market.id, partyId });
  const { data } = useQuery<EstimateOrder, EstimateOrderVariables>(
    ESTIMATE_ORDER_QUERY,
    {
      variables: {
        marketId: market.id,
        partyId,
        price: market.depth.lastTrade?.price,
        size: new BigNumber(marketPositions?.openVolume || 0)
          [order.side === VegaWalletOrderSide.Buy ? 'plus' : 'minus'](
            order.size
          )
          .toString(),
        side: order.side === VegaWalletOrderSide.Buy ? Side.Buy : Side.Sell,
        timeInForce: times[order.timeInForce],
        type: types[order.type],
      },
      skip:
        !partyId || !market.id || !order.size || !market.depth.lastTrade?.price,
    }
  );
  if (data?.estimateOrder.marginLevels.initialLevel) {
    return addDecimal(
      BigNumber.maximum(
        0,
        new BigNumber(data.estimateOrder.marginLevels.initialLevel).minus(
          marketPositions?.balance || 0
        )
      ).toString(),
      market.decimalPlaces
    );
  }
  return ' - ';
};

export default useOrderMargin;
