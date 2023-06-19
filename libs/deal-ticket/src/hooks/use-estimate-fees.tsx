import type { OrderSubmission } from '@vegaprotocol/wallet';
import {
  useVegaWallet,
  SideRevertMap,
  TimeInForceRevertMap,
  TypeRevertMap,
} from '@vegaprotocol/wallet';

import { useEstimateFeesQuery } from './__generated__/EstimateOrder';

export const useEstimateFees = (order?: OrderSubmission) => {
  const { pubKey } = useVegaWallet();

  const { data } = useEstimateFeesQuery({
    variables: order && {
      marketId: order.marketId,
      partyId: pubKey || '',
      price: order.price,
      size: String(order.size),
      side: SideRevertMap[order.side],
      timeInForce: TimeInForceRevertMap[order.timeInForce],
      type: TypeRevertMap[order.type],
    },
    fetchPolicy: 'no-cache',
    skip: !pubKey || !order?.size || !order?.price,
  });
  return data?.estimateFees;
};
