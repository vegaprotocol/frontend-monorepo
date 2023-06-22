import { useVegaWallet } from '@vegaprotocol/wallet';

import { useEstimateFeesQuery } from './__generated__/EstimateOrder';
import type { OrderObj } from '@vegaprotocol/orders';

export const useEstimateFees = (order?: OrderObj) => {
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
