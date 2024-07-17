import {
  SizeOverrideSetting,
  type OrderSubmissionBody,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import {
  createOrderSubmission,
  createStopOrdersSubmission,
  createTpSl,
} from './map-form-values-to-submission';
import * as Schema from '@vegaprotocol/types';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import type {
  OrderFormValues,
  StopOrderFormValues,
} from '@vegaprotocol/react-helpers';
import { type MarketFieldsFragment } from '@vegaprotocol/markets';

describe('mapFormValuesToOrderSubmission', () => {
  it('sets and formats price only for limit orders', () => {
    expect(
      createOrderSubmission(
        { price: '100' } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toBeUndefined();
    expect(
      createOrderSubmission(
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
      createOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toBeUndefined();
    expect(
      createOrderSubmission(
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
      createOrderSubmission(
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
      createOrderSubmission(
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
      createOrderSubmission(
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
        createOrderSubmission(
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
        createOrderSubmission(
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
        createOrderSubmission(
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
        createOrderSubmission(
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
  tradableInstrument: {
    instrument: {
      product: {
        __typename: 'Perpetual',
        id: 'productId',
        name: 'BTC/USD',
        symbol: 'BTC/USD',
      },
    },
  },
} as unknown as MarketFieldsFragment;

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

describe('mapFormValuesToStopOrdersSubmission', () => {
  it('sets and formats sizeOverrideValue', () => {
    const { risesAbove, fallsBelow } = createStopOrdersSubmission(
      {
        triggerDirection:
          Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
        sizeOverrideSetting:
          Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
        sizeOverrideValue: '10',
        size: '999',
        oco: true,
        ocoSizeOverrideSetting:
          Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
        ocoSizeOverrideValue: '20',
        ocoSize: '666',
      } as StopOrderFormValues,
      'marketId',
      2,
      2
    );
    expect(risesAbove?.sizeOverrideSetting).toEqual(
      SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
    );
    expect(risesAbove?.sizeOverrideValue?.percentage).toEqual('0.1');
    expect(risesAbove?.orderSubmission.size).toEqual('1');
    expect(fallsBelow?.sizeOverrideSetting).toEqual(
      SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
    );
    expect(fallsBelow?.sizeOverrideValue?.percentage).toEqual('0.2');
    expect(fallsBelow?.orderSubmission.size).toEqual('1');
  });
});

describe('mapFormValuesToTakeProfitAndStopLoss', () => {
  it('creates batch market instructions for a normal order created with TP and SL', () => {
    const result = createTpSl(orderFormValues, mockMarket, 'reference');

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
            sizeOverrideSetting: SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
          },
          risesAbove: {
            orderSubmission: {
              expiresAt: undefined,
              icebergOpts: undefined,
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
            sizeOverrideSetting: SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
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

    const result = createTpSl(
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

    const result = createTpSl(orderFormValuesWithTP, mockMarket, 'reference');

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
            sizeOverrideSetting: SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
            sizeOverrideValue: undefined,
          },
          fallsBelow: undefined,
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

    const result = createTpSl(orderFormValuesWithSL, mockMarket, 'reference');

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
            sizeOverrideSetting: SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
          },
          risesAbove: undefined,
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
