import merge from 'lodash/merge';
import {
  OrderTimeInForce,
  OrderType,
  Side,
  StopOrderExpiryStrategy,
  StopOrderSizeOverrideSetting,
  StopOrderTriggerDirection,
} from '@vegaprotocol/types';
import {
  createSizeOverride,
  createStopExpiry,
  createStopLimitOrder,
  createStopOrderSubmission,
  createTrigger,
  getDiscountedFee,
  getTotalDiscountFactor,
} from './utils';
import { type FormFieldsStopLimit, type FormFieldsStopMarket } from './schemas';
import { type StopOrderSetup } from '@vegaprotocol/wallet';

describe('getDiscountedFee', () => {
  it('calculates values if volumeDiscount or referralDiscount is undefined', () => {
    expect(getDiscountedFee('100')).toEqual({
      discountedFee: '100',
      volumeDiscount: '0',
      referralDiscount: '0',
      totalDiscount: '0',
    });
    expect(getDiscountedFee('100', undefined, '0.1')).toEqual({
      discountedFee: '90',
      volumeDiscount: '10',
      referralDiscount: '0',
      totalDiscount: '10',
    });
    expect(getDiscountedFee('100', '0.1', undefined)).toEqual({
      discountedFee: '90',
      volumeDiscount: '0',
      referralDiscount: '10',
      totalDiscount: '10',
    });
  });

  it('calculates values using volumeDiscount or referralDiscount', () => {
    expect(getDiscountedFee('', '0.1', '0.2')).toEqual({
      discountedFee: '',
      volumeDiscount: '0',
      referralDiscount: '0',
      totalDiscount: '0',
    });
  });
});

describe('getTotalDiscountFactor', () => {
  it('returns 0 if discounts are 0', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0',
        referralDiscountFactor: '0',
      })
    ).toEqual('0');
  });

  it('returns volumeDiscountFactor if referralDiscountFactor is 0', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0.1',
        referralDiscountFactor: '0',
      })
    ).toEqual('-0.1');
  });
  it('returns referralDiscountFactor if volumeDiscountFactor is 0', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0',
        referralDiscountFactor: '0.1',
      })
    ).toEqual('-0.1');
  });

  it('calculates discount using referralDiscountFactor and volumeDiscountFactor', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0.2',
        referralDiscountFactor: '0.1',
      })
    ).toBe('-0.28');
  });
});

describe('createStopExpiry', () => {
  it('returns undefined if not values', () => {
    expect(createStopExpiry({ stopExpiry: undefined })).toEqual(undefined);
  });

  it('returns expiry time in nanoseconds', () => {
    const ts = 1721257195557;
    const stopExpiryStrategy = StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS;
    expect(
      createStopExpiry({
        stopExpiry: true,
        stopExpiryStrategy,
        stopExpiresAt: new Date(ts),
      })
    ).toEqual({
      expiryStrategy: stopExpiryStrategy,
      expiresAt: `${ts}000000`,
    });
  });
});

describe('createSizeOverride', () => {
  it('returns no override value if override is none', () => {
    expect(
      createSizeOverride({
        sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
        size: '2',
      })
    ).toEqual({
      sizeOverrideSetting: 1,
      sizeOverrideValue: undefined,
    });
  });

  it('returns percentage if override is position', () => {
    expect(
      createSizeOverride({
        sizeOverride:
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
        size: '2',
      })
    ).toEqual({
      sizeOverrideSetting: 2,
      sizeOverrideValue: { percentage: '0.020' },
    });
  });
});

describe('createTrigger', () => {
  it('returns converted price if trigger type is price', () => {
    expect(
      createTrigger(
        {
          triggerType: 'price',
          triggerPrice: 100,
        },
        2
      )
    ).toEqual({
      price: '10000',
    });
  });

  it('returns percentage if trigger type is trailing offset', () => {
    expect(
      createTrigger(
        {
          triggerType: 'trailingPercentOffset',
          triggerPrice: 50,
        },
        2
      )
    ).toEqual({
      trailingPercentOffset: '0.500',
    });
  });
});

describe('createStopOrderSubmission', () => {
  it('flips the oco order depending on trigger direction', () => {
    const stopOrderSetup = { a: 1 } as unknown as StopOrderSetup;
    const oppositeOrder = { a: 2 } as unknown as StopOrderSetup;

    expect(
      createStopOrderSubmission(
        {
          triggerDirection:
            StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
        } as FormFieldsStopMarket,
        stopOrderSetup,
        oppositeOrder
      )
    ).toEqual({
      risesAbove: stopOrderSetup,
      fallsBelow: oppositeOrder,
    });

    expect(
      createStopOrderSubmission(
        {
          triggerDirection:
            StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
        } as FormFieldsStopMarket,
        stopOrderSetup,
        oppositeOrder
      )
    ).toEqual({
      risesAbove: oppositeOrder,
      fallsBelow: stopOrderSetup,
    });
  });
});

describe('createStopLimitOrder', () => {
  const market = {
    id: 'market-id',
    decimalPlaces: 2,
    positionDecimalPlaces: 3,
  };
  const reference = 'my-ref';
  const createFields = (): FormFieldsStopLimit => {
    return {
      ticketType: 'stopLimit',
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      triggerPrice: 200,
      size: 100,
      price: 100,
      sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      reduceOnly: true,
      postOnly: false,
      stopExpiry: false,
      oco: false,
    };
  };

  it('basic', () => {
    const fields = createFields();
    const res = createStopLimitOrder(fields, market, reference);
    expect(res).toEqual({
      risesAbove: {
        orderSubmission: {
          reference,
          marketId: market.id,
          type: fields.type,
          side: fields.side,
          timeInForce: fields.timeInForce,
          price: '10000',
          size: '100000',
          expiresAt: undefined,
          reduceOnly: true,
        },
        price: '20000',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
      },
      fallsBelow: undefined,
    });
  });

  it('trailing percent offset', () => {
    const fields = merge(createFields(), {
      triggerType: 'trailingPercentOffset',
      triggerPrice: 25,
    });
    const res = createStopLimitOrder(fields, market, reference);
    expect(res).toEqual({
      risesAbove: {
        orderSubmission: expect.any(Object),
        trailingPercentOffset: '0.250',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
      },
      fallsBelow: undefined,
    });
  });

  it('expiry', () => {
    const ts = 1721257195557;
    const fields = merge(createFields(), {
      stopExpiry: true,
      stopExpiresAt: new Date(ts),
      stopExpiryStrategy: StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS,
    });
    const res = createStopLimitOrder(fields, market, reference);
    expect(res).toEqual({
      risesAbove: {
        orderSubmission: expect.any(Object),
        price: '20000',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
        expiresAt: `${ts}000000`,
        expiryStrategy: fields.stopExpiryStrategy,
      },
      fallsBelow: undefined,
    });
  });

  it('size override', () => {
    const fields = createFields();
    const res = createStopLimitOrder(
      merge(fields, {
        sizeOverride:
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
        size: 10,
      }),
      market,
      reference
    );
    expect(res).toEqual({
      risesAbove: {
        orderSubmission: expect.objectContaining({
          size: '0.001',
        }),
        price: '20000',
        sizeOverrideSetting: 2,
        sizeOverrideValue: { percentage: '0.100' },
      },
      fallsBelow: undefined,
    });
  });

  it('falls below', () => {
    const fields = createFields();
    const res = createStopLimitOrder(
      merge(fields, {
        triggerDirection:
          StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
      }),
      market,
      reference
    );
    expect(res).toEqual({
      risesAbove: undefined,
      fallsBelow: {
        orderSubmission: expect.any(Object),
        price: '20000',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
      },
    });
  });

  it('oco with missing fields should throw', () => {
    const fields = createFields();
    expect(() => {
      createStopLimitOrder(
        merge(fields, {
          oco: true,
        }),
        market,
        reference
      );
    }).toThrow();
  });

  it('oco', () => {
    const fields = merge(createFields(), {
      oco: true,
      ocoType: OrderType.TYPE_MARKET,
      ocoPrice: 100,
      ocoSize: 200,
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      ocoTriggerType: 'price',
      ocoTriggerPrice: 50,
    });
    const res = createStopLimitOrder(fields, market, reference);

    expect(res).toEqual({
      risesAbove: {
        orderSubmission: expect.any(Object),
        price: '20000',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
      },
      fallsBelow: {
        orderSubmission: {
          reference,
          marketId: market.id,
          type: fields.ocoType,
          side: fields.side,
          timeInForce: fields.ocoTimeInForce,
          price: '10000',
          size: '200000',
          expiresAt: undefined,
          reduceOnly: true,
        },
        price: '5000',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
      },
    });
  });

  it('oco sizeOverride', () => {
    const fields = merge(createFields(), {
      oco: true,
      ocoType: OrderType.TYPE_MARKET,
      ocoPrice: 100,
      ocoSize: 85,
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      ocoSizeOverride:
        StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
      ocoTriggerType: 'trailingPercentOffset',
      ocoTriggerPrice: 50,
    });
    const res = createStopLimitOrder(fields, market, reference);

    expect(res).toEqual({
      risesAbove: {
        orderSubmission: expect.any(Object),
        price: '20000',
        sizeOverrideSetting: 1,
        sizeOverrideValue: undefined,
      },
      fallsBelow: {
        orderSubmission: {
          reference,
          marketId: market.id,
          type: fields.ocoType,
          side: fields.side,
          timeInForce: fields.ocoTimeInForce,
          price: '10000',
          size: '0.001',
          expiresAt: undefined,
          reduceOnly: true,
        },
        trailingPercentOffset: '0.500',
        sizeOverrideSetting: 2,
        sizeOverrideValue: { percentage: '0.850' },
      },
    });
  });
});
