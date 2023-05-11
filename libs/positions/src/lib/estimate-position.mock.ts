import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { EstimatePositionQuery } from './__generated__/Positions';

export const estimatePositionQuery = (
  override?: PartialDeep<EstimatePositionQuery>
): EstimatePositionQuery => {
  const defaultResult: EstimatePositionQuery = {
    estimatePosition: {
      __typename: 'PositionEstimate',
      margin: {
        bestCase: {
          collateralReleaseLevel: '1000000',
          initialLevel: '500000',
          maintenanceLevel: '200000',
          searchLevel: '300000',
        },
        worstCase: {
          collateralReleaseLevel: '1100000',
          initialLevel: '600000',
          maintenanceLevel: '300000',
          searchLevel: '400000',
        },
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
