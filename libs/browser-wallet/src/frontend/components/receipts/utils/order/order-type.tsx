import type { OrderType as vegaOrderType } from '@vegaprotocol/enums';

import { ORDER_TYPE } from '@/lib/enums';

export const OrderType = ({ type }: { type: vegaOrderType }) => {
  return ORDER_TYPE[type];
};
