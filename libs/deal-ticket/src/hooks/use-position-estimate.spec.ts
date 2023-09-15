import { renderHook } from '@testing-library/react';
import { usePositionEstimate } from './use-position-estimate';
import * as positionsModule from '@vegaprotocol/positions';
import type {
  EstimatePositionQuery,
  EstimatePositionQueryVariables,
} from '@vegaprotocol/positions';
import type { QueryResult } from '@apollo/client';

let mockData: object | undefined = {};

describe('usePositionEstimate', () => {
  const args = {
    marketId: 'marketId',
    openVolume: '10',
    orders: [],
    collateralAvailable: '200',
    skip: false,
  };
  it('should return proper data', () => {
    jest
      .spyOn(positionsModule, 'useEstimatePositionQuery')
      .mockReturnValue({ data: mockData } as unknown as QueryResult<
        EstimatePositionQuery,
        EstimatePositionQueryVariables
      >);
    const { result, rerender } = renderHook(() => usePositionEstimate(args));
    expect(result.current).toEqual(mockData);
    mockData = undefined;
    rerender(true);
    expect(result.current).toEqual({});
  });
});
