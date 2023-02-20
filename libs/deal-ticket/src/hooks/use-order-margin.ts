import { useMemo } from 'react';
import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';

export interface Props
  extends Pick<
    OrderSubmissionBody['orderSubmission'],
    'side' | 'size' | 'timeInForce' | 'type' | 'price'
  > {
  marketId: string;
  partyId: string;
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
  side,
  size,
  marketId,
  partyId,
  price,
  timeInForce,
  type,
}: Props): OrderMargin | null => {
  const variables = {
    marketId,
    partyId,
    price,
    size,
    side,
    timeInForce,
    type,
  };
  const { data } = useEstimateOrderQuery({
    variables,
    skip: !partyId || !marketId || !size || !price,
  });
  const { makerFee, liquidityFee, infrastructureFee } = data?.estimateOrder
    .fee || { makerFee: '', liquidityFee: '', infrastructureFee: '' };
  const { initialLevel } = data?.estimateOrder.marginLevels ?? {};
  return useMemo(() => {
    if (initialLevel) {
      const fees = new BigNumber(makerFee)
        .plus(liquidityFee)
        .plus(infrastructureFee)
        .toString();
      return {
        margin: initialLevel,
        totalFees: fees,
        fees: {
          makerFee,
          liquidityFee,
          infrastructureFee,
        },
      };
    }
    return null;
  }, [initialLevel, makerFee, liquidityFee, infrastructureFee]);
};
