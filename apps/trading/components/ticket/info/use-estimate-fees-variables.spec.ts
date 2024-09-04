import { renderHook } from '@testing-library/react';
import merge from 'lodash/merge';
import { type PartialDeep } from 'type-fest';
import {
  useEstimateFeesVariables,
  type UseEstimateFeesVariablesArgs,
} from './use-estimate-fees-variables';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { type FormFieldsMarket } from '../schemas';

describe('useEstimateFeesVariables', () => {
  const createArgs = (override?: PartialDeep<UseEstimateFeesVariablesArgs>) => {
    const args: UseEstimateFeesVariablesArgs = {
      useOcoFields: false,
      partyId: 'partyId',
      markPrice: '100',
      values: {
        ticketType: 'market',
        type: OrderType.TYPE_MARKET,
        size: 10,
        postOnly: false,
        side: Side.SIDE_BUY,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      } as FormFieldsMarket,
      market: {
        id: 'marketId',
        decimalPlaces: 2,
        positionDecimalPlaces: 2,
      },
    };
    return merge(args, override);
  };

  const setup = (args: UseEstimateFeesVariablesArgs) => {
    return renderHook(() => useEstimateFeesVariables(args));
  };

  it('market', () => {
    const args = createArgs();
    const { result } = setup(args);
    expect(result.current).toEqual({
      marketId: args.market.id,
      partyId: args.partyId,
      type: OrderType.TYPE_MARKET,
      side: args.values.side,
      timeInForce: args.values.timeInForce,
      size: '1000',
      price: args.markPrice,
    });
  });

  it('limit', () => {
    const args = createArgs({
      values: {
        ticketType: 'limit',
        price: 5555,
        type: OrderType.TYPE_LIMIT,
      },
    });
    const { result } = setup(args);
    expect(result.current).toEqual({
      marketId: args.market.id,
      partyId: args.partyId,
      type: OrderType.TYPE_LIMIT,
      side: args.values.side,
      timeInForce: args.values.timeInForce,
      size: '1000',
      price: '555500',
    });
  });

  it('stop market use trigger price', () => {
    const args = createArgs({
      values: {
        ticketType: 'stopMarket',
        ocoTriggerType: 'price',
        triggerPrice: 66,
      },
    });
    const { result } = setup(args);
    expect(result.current).toMatchObject({
      price: '6600',
    });
  });

  it('stop market use trailing offset', () => {
    const args = createArgs({
      markPrice: '200',
      values: {
        ticketType: 'stopMarket',
        ocoTriggerType: 'trailingPercentOffset',
      },
    });
    const { result } = setup(args);
    expect(result.current).toMatchObject({
      price: '200',
    });
  });

  it('stop market using oco fields', () => {
    const args = createArgs({
      markPrice: '200',
      useOcoFields: true,
      values: {
        ticketType: 'stopMarket',
        size: 100,
        ocoSize: 300,
        ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      },
    });
    const { result } = setup(args);
    expect(result.current).toMatchObject({
      size: '30000',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    });
  });

  it('stop limit', () => {
    const args = createArgs({
      values: {
        ticketType: 'stopLimit',
        size: 10,
        price: 200,
      },
    });
    const { result } = setup(args);
    expect(result.current).toMatchObject({
      type: OrderType.TYPE_LIMIT,
      size: '1000',
      price: '20000',
    });
  });

  it('stop limit using oco fields', () => {
    const args = createArgs({
      useOcoFields: true,
      values: {
        ticketType: 'stopLimit',
        size: 10,
        price: 200,
        ocoSize: 300,
        ocoPrice: 400,
        ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_GFN,
      },
    });
    const { result } = setup(args);
    expect(result.current).toMatchObject({
      type: OrderType.TYPE_LIMIT,
      size: '30000',
      price: '40000',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFN,
    });
  });
});
