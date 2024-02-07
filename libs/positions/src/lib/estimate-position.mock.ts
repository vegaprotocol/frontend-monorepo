import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { EstimatePositionQuery } from './__generated__/Positions';

export const estimatePositionQuery = (
  override?: PartialDeep<EstimatePositionQuery>
): EstimatePositionQuery => {
  const defaultResult: EstimatePositionQuery = {
    estimatePosition: {
      __typename: 'PositionEstimate',
      collateralIncreaseEstimate: {
        bestCase: '0',
        worstCase: '0',
      },
      liquidation: {
        bestCase: {
          including_buy_orders: '1',
          including_sell_orders: '1',
          open_volume_only: '1',
        },
        worstCase: {
          including_buy_orders: '1',
          including_sell_orders: '1',
          open_volume_only: '1',
        },
      },
    },
  };
  return merge(defaultResult, override);
};
