import merge from 'lodash/merge';
import { type MarketInfo } from '@vegaprotocol/markets';
import {
  createMarketSchema,
  createLimitSchema,
  createStopMarketSchema,
  createStopLimitSchema,
  type FormFieldsMarket,
  type FormFieldsLimit,
  type FormFieldsStopLimit,
  type FormFieldsStopMarket,
} from './schemas';
import {
  OrderTimeInForce,
  OrderType,
  Side,
  StopOrderTriggerDirection,
} from '@vegaprotocol/types';
import { subDays } from 'date-fns';

const marketInfo = {
  decimalPlaces: 0,
  positionDecimalPlaces: 0,
  tickSize: '1',
  tradableInstrument: {
    instrument: {
      product: {
        __typename: 'Future',
      },
    },
  },
} as MarketInfo;

describe('ticket market schema', () => {
  const createFields = (override?: Partial<FormFieldsMarket>) => {
    const fields: FormFieldsMarket = {
      ticketType: 'market',
      sizeMode: 'contracts',
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: 100,
      notional: 100,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      tpSl: false,
      reduceOnly: false,
    };
    return merge(fields, override);
  };

  it('time in force must be fok or ioc', () => {
    const schema = createMarketSchema(marketInfo);
    const fields = createFields({
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['timeInForce']);
  });

  it('takeProfit or stopLoss required when tpSl true', () => {
    const schema = createMarketSchema(marketInfo);
    const fields = createFields({
      tpSl: true,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['takeProfit']);
  });
});

describe('ticket limit schema', () => {
  const createFields = (override?: Partial<FormFieldsLimit>) => {
    const fields: FormFieldsLimit = {
      ticketType: 'limit',
      sizeMode: 'contracts',
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      size: 100,
      price: 100,
      notional: 100,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      tpSl: false,
      reduceOnly: false,
      postOnly: false,
      iceberg: false,
    };
    return merge(fields, override);
  };

  it('gtt requires expiresAt', () => {
    const schema = createLimitSchema(marketInfo);
    const fields = createFields({
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['expiresAt']);
  });

  it('gtt requires expiresAt in the future', () => {
    const date = new Date('2024-10-10');
    jest.useFakeTimers().setSystemTime(date);
    const schema = createLimitSchema(marketInfo);
    const fields = createFields({
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT,
      expiresAt: subDays(date, 1),
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['expiresAt']);
    jest.useRealTimers();
  });

  it('takeProfit or stopLoss required when tpSl true', () => {
    const schema = createLimitSchema(marketInfo);
    const fields = createFields({
      tpSl: true,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['takeProfit']);
  });

  it('iceberg requireds peak and min visible', () => {
    const schema = createLimitSchema(marketInfo);
    const fields = createFields({
      iceberg: true,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['icebergPeakSize']);
  });
});

describe('ticket stop market schema', () => {
  const createFields = (override?: Partial<FormFieldsStopMarket>) => {
    const fields: FormFieldsStopMarket = {
      ticketType: 'stopMarket',
      sizeMode: 'contracts',
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      triggerType: 'price',
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerPrice: 100,
      size: 100,
      notional: 0,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      reduceOnly: true,
      oco: false,
      stopExpiryStrategy: 'none',
    };
    return merge(fields, override);
  };

  it('oco requires ocoTriggerPrice and ocoSize', () => {
    const schema = createStopMarketSchema(marketInfo);
    const fields = createFields({
      oco: true,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues.map((i) => i.path)).toEqual([
      ['ocoTriggerPrice'],
      ['ocoSize'],
    ]);
  });

  it('stopExpiryStrategy requires stopExpiresAt', () => {
    const schema = createStopMarketSchema(marketInfo);
    const fields = createFields({
      stopExpiryStrategy: 'cancel',
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues.map((i) => i.path)).toEqual([['stopExpiresAt']]);
  });

  it('stop orders must be reduce only unless spot market', () => {
    // reduce only should fail
    const schema = createStopMarketSchema(marketInfo);
    let fields = createFields({ reduceOnly: false });
    let res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['reduceOnly']);

    // schema created for spot market, reduce only is allowed
    const schemaSpot = createStopMarketSchema({
      ...marketInfo,
      tradableInstrument: {
        // @ts-ignore override nested product obj
        instrument: { product: { __typename: 'Spot' } },
      },
    });

    fields = createFields({ reduceOnly: false });
    res = schemaSpot.safeParse(fields);
    expect(res.success).toEqual(true);
  });
});

describe('ticket stop limit schema', () => {
  const createFields = (override?: Partial<FormFieldsStopLimit>) => {
    const fields: FormFieldsStopLimit = {
      ticketType: 'stopLimit',
      sizeMode: 'contracts',
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      triggerType: 'price',
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerPrice: 100,
      size: 100,
      notional: 0,
      price: 100,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      reduceOnly: true,
      postOnly: false,
      oco: false,
      stopExpiryStrategy: 'none',
    };
    return merge(fields, override);
  };

  it('oco requires ocoTriggerPrice, ocoSize and ocoPrice', () => {
    const schema = createStopLimitSchema(marketInfo);
    const fields = createFields({
      oco: true,
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues.map((i) => i.path)).toEqual([
      ['ocoTriggerPrice'],
      ['ocoSize'],
      ['ocoPrice'],
    ]);
  });

  it('stopExpiryStrategy requires stopExpiresAt', () => {
    const schema = createStopLimitSchema(marketInfo);
    const fields = createFields({
      stopExpiryStrategy: 'cancel',
    });
    const res = schema.safeParse(fields);
    expect(res.error?.issues.map((i) => i.path)).toEqual([['stopExpiresAt']]);
  });

  it('stop orders must be reduce only unless spot market', () => {
    // reduce only should fail
    const schema = createStopLimitSchema(marketInfo);
    let fields = createFields({ reduceOnly: false });
    let res = schema.safeParse(fields);
    expect(res.error?.issues[0].path).toEqual(['reduceOnly']);

    // schema created for spot market, reduce only is allowed
    const schemaSpot = createStopLimitSchema({
      ...marketInfo,
      tradableInstrument: {
        // @ts-ignore override nested product obj
        instrument: { product: { __typename: 'Spot' } },
      },
    });

    fields = createFields({ reduceOnly: false });
    res = schemaSpot.safeParse(fields);
    expect(res.success).toEqual(true);
  });
});
