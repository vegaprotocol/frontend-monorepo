import { useMemo } from 'react';
import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { removeDecimal } from '@vegaprotocol/react-helpers';
import { useMarketPositions } from './use-market-positions';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { getDerivedPrice } from '../utils/get-price';

export interface Props {
  order: OrderSubmissionBody['orderSubmission'];
  market: MarketDealTicket;
  partyId: string;
  derivedPrice?: string;
}

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
  const { balance } = useMarketPositions({ marketId: market.id }) || {};
  const priceForEstimate = derivedPrice || getDerivedPrice(order, market);

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
  const { makerFee, liquidityFee, infrastructureFee } = data?.estimateOrder
    .fee || { makerFee: '', liquidityFee: '', infrastructureFee: '' };
  const { initialLevel } = data?.estimateOrder.marginLevels ?? {};
  return useMemo(() => {
    if (initialLevel) {
      const margin = BigNumber.maximum(
        0,
        new BigNumber(initialLevel).minus(balance || 0)
      ).toString();
      const fees = new BigNumber(makerFee)
        .plus(liquidityFee)
        .plus(infrastructureFee)
        .toString();
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
  }, [initialLevel, makerFee, liquidityFee, infrastructureFee, balance]);
};
