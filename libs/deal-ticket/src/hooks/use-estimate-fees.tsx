import { useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

import { useEstimateFeesQuery } from './__generated__/EstimateOrder';

export const useEstimateFees = (
  order?: OrderSubmissionBody['orderSubmission']
) => {
  const { pubKey } = useVegaWallet();

  const { data } = useEstimateFeesQuery({
    variables: order && {
      marketId: order.marketId,
      partyId: pubKey || '',
      price: order.price,
      size: order.size,
      side: order.side,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    fetchPolicy: 'no-cache',
    skip: !pubKey || !order?.size || !order?.price,
  });
  return data?.estimateFees;
};
