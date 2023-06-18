import { useVegaWallet } from '@vegaprotocol/wallet';
import type { DealTicketOrderSubmission } from '@vegaprotocol/wallet';

import { useEstimateFeesQuery } from './__generated__/EstimateOrder';

export const useEstimateFees = (order?: DealTicketOrderSubmission) => {
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
