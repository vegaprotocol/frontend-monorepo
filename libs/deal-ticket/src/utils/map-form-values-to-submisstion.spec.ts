import type {
  OrderSubmissionBody,
  StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from './map-form-values-to-submission';
import * as Schema from '@vegaprotocol/types';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import type { OrderFormValues } from '../hooks';
import { type MarketFieldsFragment } from '@vegaprotocol/markets';

describe('mapFormValuesToOrderSubmission', () => {
  it('sets and formats price only for limit orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        { price: '100' } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toBeUndefined();
    expect(
      mapFormValuesToOrderSubmission(
        {
          price: '100',
          type: Schema.OrderType.TYPE_LIMIT,
        } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toEqual('10000');
  });

  it('sets and formats expiresAt only for GTT orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toBeUndefined();
    expect(
      mapFormValuesToOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toEqual('1640995200000000000');
  });

  it('sets and formats icebergOpts only for persisted orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          type: OrderType.TYPE_LIMIT,
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
          iceberg: true,
          peakSize: '10.00',
          minimumVisibleSize: '10.00',
        } as OrderFormValues,
        'marketId',
        2,
        2
      ).icebergOpts
    ).toEqual(undefined);

    expect(
      mapFormValuesToOrderSubmission(
        {
          type: OrderType.TYPE_LIMIT,
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
          iceberg: true,
          peakSize: '10.00',
          minimumVisibleSize: '10.00',
        } as OrderFormValues,
        'marketId',
        2,
        2
      ).icebergOpts
    ).toEqual({
      peakSize: '1000',
      minimumVisibleSize: '1000',
    });
  });

  it('formats size', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          size: '100',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).size
    ).toEqual('1000');
  });

  it.each([
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK, postOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFA, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFN, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC, postOnly: false },
  ])(
    'sets postOnly correctly when TIF is $timeInForce',
    ({
      timeInForce,
      postOnly,
    }: {
      timeInForce: OrderTimeInForce;
      postOnly: boolean;
    }) => {
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_LIMIT,
            timeInForce,
            postOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).postOnly
      ).toEqual(postOnly);
      // sets always false if type is market
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_MARKET,
            timeInForce,
            postOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).postOnly
      ).toEqual(false);
    }
  );

  it.each([
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK, reduceOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFA, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFN, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC, reduceOnly: true },
  ])(
    'sets reduceOnly correctly when TIF is $timeInForce',
    ({
      timeInForce,
      reduceOnly,
    }: {
      timeInForce: OrderTimeInForce;
      reduceOnly: boolean;
    }) => {
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_MARKET,
            timeInForce,
            reduceOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).reduceOnly
      ).toEqual(reduceOnly);
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_LIMIT,
            timeInForce,
            reduceOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).reduceOnly
      ).toEqual(reduceOnly);
    }
  );
});

const mockMarket: MarketFieldsFragment = {
  __typename: 'Market',
  id: 'marketId',
  decimalPlaces: 1,
  positionDecimalPlaces: 4,
  state: Schema.MarketState.STATE_ACTIVE,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
} as MarketFieldsFragment;

const orderFormValues: OrderFormValues = {
  type: OrderType.TYPE_LIMIT,
  side: Schema.Side.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
  size: '1',
  price: '66300',
  postOnly: false,
  reduceOnly: false,
  tpSl: true,
  takeProfit: '70000',
  stopLoss: '60000',
};

describe('mapFormValuesToTakeProfitAndStopLoss', () => {
  it('creates batch market instructions for a normal order created with TP and SL', () => {
    const result = mapFormValuesToTakeProfitAndStopLoss(
      orderFormValues,
      mockMarket,
      'reference'
    );

    const expected: {
      submissions: Schema.OrderSubmission[];
      stopOrdersSubmission: StopOrdersSubmission[];
    } = {
      stopOrdersSubmission: [
        {
          fallsBelow: {
            orderSubmission: {
              expiresAt: undefined,
              marketId: 'marketId',
              postOnly: false,
              price: undefined,
              reduceOnly: true,
              reference: 'reference',
              side: Schema.Side.SIDE_SELL,
              size: '10000',
              timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
              type: OrderType.TYPE_MARKET,
            },
            price: '600000',
          },
          risesAbove: {
            orderSubmission: {
              expiresAt: undefined,
              marketId: 'marketId',
              postOnly: false,
              price: undefined,
              reduceOnly: true,
              reference: 'reference',
              side: Schema.Side.SIDE_SELL,
              size: '10000',
              timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
              type: OrderType.TYPE_MARKET,
            },
            price: '700000',
          },
        },
      ],
      submissions: [
        {
          expiresAt: undefined,
          marketId: 'marketId',
          postOnly: false,
          price: '663000',
          reduceOnly: false,
          reference: 'reference',
          side: Schema.Side.SIDE_BUY,
          size: '10000',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
          type: OrderType.TYPE_LIMIT,
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('creates batch market instructions for a normal order created without TP and SL', () => {
    // Create order form values without TP and SL
    const orderFormValuesWithoutTPSL = { ...orderFormValues };
    delete orderFormValuesWithoutTPSL.takeProfit;
    delete orderFormValuesWithoutTPSL.stopLoss;

    const result = mapFormValuesToTakeProfitAndStopLoss(
      orderFormValuesWithoutTPSL,
      mockMarket,
      'reference'
    );

    // Expected result when TP and SL are not provided
    const expected: {
      submissions: Schema.OrderSubmission[];
      stopOrdersSubmission: StopOrdersSubmission[];
    } = {
      stopOrdersSubmission: [],
      submissions: [
        {
          expiresAt: undefined,
          marketId: 'marketId',
          postOnly: false,
          price: '663000',
          reduceOnly: false,
          reference: 'reference',
          side: Schema.Side.SIDE_BUY,
          size: '10000',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
          type: OrderType.TYPE_LIMIT,
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('creates batch market instructions for a normal order created with TP only', () => {
    // Create order form values with TP only
    const orderFormValuesWithTP = { ...orderFormValues };
    orderFormValuesWithTP.stopLoss = undefined;

    const result = mapFormValuesToTakeProfitAndStopLoss(
      orderFormValuesWithTP,
      mockMarket,
      'reference'
    );

    // Expected result when only TP is provided
    const expected: {
      submissions: Schema.OrderSubmission[];
      stopOrdersSubmission: StopOrdersSubmission[];
    } = {
      stopOrdersSubmission: [
        {
          risesAbove: {
            orderSubmission: {
              expiresAt: undefined,
              marketId: 'marketId',
              postOnly: false,
              price: undefined,
              reduceOnly: true,
              reference: 'reference',
              side: Schema.Side.SIDE_SELL,
              size: '10000',
              timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
              type: OrderType.TYPE_MARKET,
            },
            price: '700000',
          },
        },
      ],
      submissions: [
        {
          expiresAt: undefined,
          marketId: 'marketId',
          postOnly: false,
          price: '663000',
          reduceOnly: false,
          reference: 'reference',
          side: Schema.Side.SIDE_BUY,
          size: '10000',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
          type: OrderType.TYPE_LIMIT,
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('creates batch market instructions for a normal order created with SL only', () => {
    // Create order form values with SL only
    const orderFormValuesWithSL = { ...orderFormValues };
    orderFormValuesWithSL.takeProfit = undefined;

    const result = mapFormValuesToTakeProfitAndStopLoss(
      orderFormValuesWithSL,
      mockMarket,
      'reference'
    );

    // Expected result when only SL is provided
    const expected: {
      submissions: Schema.OrderSubmission[];
      stopOrdersSubmission: StopOrdersSubmission[];
    } = {
      stopOrdersSubmission: [
        {
          fallsBelow: {
            orderSubmission: {
              expiresAt: undefined,
              marketId: 'marketId',
              postOnly: false,
              price: undefined,
              reduceOnly: true,
              reference: 'reference',
              side: Schema.Side.SIDE_SELL,
              size: '10000',
              timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
              type: OrderType.TYPE_MARKET,
            },
            price: '600000',
          },
        },
      ],
      submissions: [
        {
          expiresAt: undefined,
          marketId: 'marketId',
          postOnly: false,
          price: '663000',
          reduceOnly: false,
          reference: 'reference',
          side: Schema.Side.SIDE_BUY,
          size: '10000',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
          type: OrderType.TYPE_LIMIT,
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});
