import type { ApolloClient } from '@apollo/client';
import type { Duration } from 'date-fns';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import type {
  Candle,
  DataSource,
  LabelAnnotation,
  PriceMonitoringBounds,
} from 'pennant';
import { Interval as PennantInterval } from 'pennant';

import {
  addDecimal,
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { ChartDocument } from './__generated__/Chart';
import type { ChartQuery, ChartQueryVariables } from './__generated__/Chart';
import {
  CandlesDocument,
  CandlesEventsDocument,
} from './__generated__/Candles';
import type {
  CandlesQuery,
  CandlesQueryVariables,
  CandleFieldsFragment,
  CandlesEventsSubscription,
  CandlesEventsSubscriptionVariables,
} from './__generated__/Candles';
import type { Subscription } from 'zen-observable-ts';
import * as Schema from '@vegaprotocol/types';
import { OrdersDocument, OrdersUpdateDocument } from '@vegaprotocol/orders';

import type {
  OrderFieldsFragment,
  OrderUpdateFieldsFragment,
  OrdersQuery,
  OrdersQueryVariables,
  OrdersUpdateSubscription,
  OrdersUpdateSubscriptionVariables,
} from '@vegaprotocol/orders';
import { filterOrderUpdates } from '@vegaprotocol/orders';
import { t } from '@vegaprotocol/i18n';

const INTERVAL_TO_PENNANT_MAP = {
  [PennantInterval.I1M]: Schema.Interval.INTERVAL_I1M,
  [PennantInterval.I5M]: Schema.Interval.INTERVAL_I5M,
  [PennantInterval.I15M]: Schema.Interval.INTERVAL_I15M,
  [PennantInterval.I1H]: Schema.Interval.INTERVAL_I1H,
  [PennantInterval.I6H]: Schema.Interval.INTERVAL_I6H,
  [PennantInterval.I1D]: Schema.Interval.INTERVAL_I1D,
};

const defaultConfig = {
  decimalPlaces: 5,
  supportedIntervals: [
    PennantInterval.I1D,
    PennantInterval.I6H,
    PennantInterval.I1H,
    PennantInterval.I15M,
    PennantInterval.I5M,
    PennantInterval.I1M,
  ],
};

type AnnotationOrder = Pick<
  OrderFieldsFragment,
  | 'id'
  | 'expiresAt'
  | 'price'
  | 'side'
  | 'size'
  | 'status'
  | 'timeInForce'
  | 'type'
>;

const liveOnlyOrderStatuses = [
  Schema.OrderStatus.STATUS_ACTIVE,
  Schema.OrderStatus.STATUS_PARKED,
];

/**
 * A data access object that provides access to the Vega GraphQL API.
 */
export class VegaDataSource implements DataSource {
  client: ApolloClient<object>;
  marketId: string;
  partyId: null | string;
  _decimalPlaces = 0;
  _positionDecimalPlaces = 0;
  orders: AnnotationOrder[] = [];

  candlesSub: Subscription | null = null;
  ordersSub: Subscription | null = null;

  /**
   * Indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the Market.
   */
  get decimalPlaces(): number {
    return this._decimalPlaces;
  }

  /**
   * Indicates the number of position decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the unit size of the Market.
   */
  get positionDecimalPlaces(): number {
    return this._positionDecimalPlaces;
  }

  /**
   *
   * @param client - An ApolloClient instance.
   * @param marketId - Market identifier.
   * @param partyId - Party identifier.
   */
  constructor(
    client: ApolloClient<object>,
    marketId: string,
    partyId: null | string = null
  ) {
    this.client = client;
    this.marketId = marketId;
    this.partyId = partyId;
  }

  /**
   * Used by the charting library to initialize itself.
   */
  async onReady() {
    try {
      const { data } = await this.client.query<ChartQuery, ChartQueryVariables>(
        {
          query: ChartDocument,
          variables: {
            marketId: this.marketId,
          },
          fetchPolicy: 'no-cache',
        }
      );

      if (data && data.market && data.market.data) {
        this._decimalPlaces = data.market.decimalPlaces;
        this._positionDecimalPlaces = data.market.positionDecimalPlaces;

        let priceMonitoringBounds: PriceMonitoringBounds[] | undefined;

        if (data.market.data.priceMonitoringBounds) {
          priceMonitoringBounds = data.market.data.priceMonitoringBounds.map(
            (bounds) => ({
              maxValidPrice: Number(
                addDecimal(bounds.maxValidPrice, this._decimalPlaces)
              ),
              minValidPrice: Number(
                addDecimal(bounds.minValidPrice, this._decimalPlaces)
              ),
              referencePrice: Number(
                addDecimal(bounds.referencePrice, this._decimalPlaces)
              ),
            })
          );
        }

        return {
          decimalPlaces: this._decimalPlaces,
          positionDecimalPlaces: this._positionDecimalPlaces,
          supportedIntervals: [
            PennantInterval.I1D,
            PennantInterval.I6H,
            PennantInterval.I1H,
            PennantInterval.I15M,
            PennantInterval.I5M,
            PennantInterval.I1M,
          ],
          priceMonitoringBounds: priceMonitoringBounds,
        };
      } else {
        return defaultConfig;
      }
    } catch {
      return defaultConfig;
    }
  }

  /**
   * Used by the charting library to get historical data.
   */
  async query(interval: PennantInterval, from: string) {
    try {
      const { data } = await this.client.query<
        CandlesQuery,
        CandlesQueryVariables
      >({
        query: CandlesDocument,
        variables: {
          marketId: this.marketId,
          interval: INTERVAL_TO_PENNANT_MAP[interval],
          since: from,
        },
        fetchPolicy: 'no-cache',
      });

      if (data?.market?.candlesConnection?.edges) {
        const decimalPlaces = data.market.decimalPlaces;
        const positionDecimalPlaces = data.market.positionDecimalPlaces;

        const candles = data.market.candlesConnection.edges
          .map((edge) => edge?.node)
          .filter((node): node is CandleFieldsFragment => !!node)
          .map((node) =>
            parseCandle(node, decimalPlaces, positionDecimalPlaces)
          )
          .reduce(checkGranulationContinuity(interval), []);
        return candles;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Used by the charting library to create a subscription to streaming data.
   */
  subscribeData(
    interval: PennantInterval,
    onSubscriptionData: (data: Candle) => void
  ) {
    const res = this.client.subscribe<
      CandlesEventsSubscription,
      CandlesEventsSubscriptionVariables
    >({
      query: CandlesEventsDocument,
      variables: {
        marketId: this.marketId,
        interval: INTERVAL_TO_PENNANT_MAP[interval],
      },
    });

    this.candlesSub = res.subscribe(({ data }) => {
      if (data) {
        const candle = parseCandle(
          data.candles,
          this.decimalPlaces,
          this.positionDecimalPlaces
        );

        onSubscriptionData(candle);
      }
    });
  }

  /**
   * Used by the charting library to clean-up a subscription to streaming data.
   */
  unsubscribeData() {
    this.candlesSub && this.candlesSub.unsubscribe();
  }

  async subscribeAnnotations(
    onSubscriptionAnnotations: (annotations: LabelAnnotation[]) => void
  ) {
    const { data } = await this.client.query<OrdersQuery, OrdersQueryVariables>(
      {
        query: OrdersDocument,
        variables: {
          marketIds: this.marketId,
          partyId:
            this.partyId ??
            'c20b8de94b17685a17ca5d4e3da848ce3b82166fadba0e7b071eead303999fb0',
        },
        fetchPolicy: 'no-cache',
      }
    );

    if (data.party?.ordersConnection?.edges) {
      console.log(
        'query',
        data.party.ordersConnection?.edges.map((edge) => edge.node)
      );

      this.orders = data.party.ordersConnection.edges
        .map((edge) => edge.node)
        .filter((order) => liveOnlyOrderStatuses.includes(order.status));

      console.log(this.orders);

      const annotations = this.orders.map((order) =>
        parseOrder(order, this.decimalPlaces, this.positionDecimalPlaces)
      );

      onSubscriptionAnnotations(annotations);
    }

    const res = this.client.subscribe<
      OrdersUpdateSubscription,
      OrdersUpdateSubscriptionVariables
    >({
      query: OrdersUpdateDocument,
      variables: {
        marketIds: this.marketId,
        partyId:
          this.partyId ??
          'c20b8de94b17685a17ca5d4e3da848ce3b82166fadba0e7b071eead303999fb0', // FIXME: Remove null coalescing operator
      },
    });

    this.ordersSub = res.subscribe(({ data }) => {
      if (data && data.orders) {
        console.log('subscription', data.orders);

        for (const orderUpdate of filterOrderUpdates(data.orders)) {
          const matchingOrder = this.orders.find(
            (order) => order.id === orderUpdate.id
          );

          if (matchingOrder) {
            Object.assign(matchingOrder, orderUpdate);
          } else {
            this.orders.push(orderUpdate);
          }
        }

        this.orders = this.orders.filter((order) =>
          liveOnlyOrderStatuses.includes(order.status)
        );

        const annotations =
          this.orders.map((order) =>
            parseOrder(order, this.decimalPlaces, this.positionDecimalPlaces)
          ) ?? [];

        onSubscriptionAnnotations(annotations);
      }
    });
  }

  unsubscribeAnnotations(): void {
    this.ordersSub && this.ordersSub.unsubscribe();
  }
}

const getDuration = (
  interval: PennantInterval,
  multiplier: number
): Duration => {
  switch (interval) {
    case 'I1D':
      return {
        days: 1 * multiplier,
      };
    case 'I1H':
      return {
        hours: 1 * multiplier,
      };
    case 'I1M':
      return {
        minutes: 1 * multiplier,
      };
    case 'I5M':
      return {
        minutes: 5 * multiplier,
      };
    case 'I6H':
      return {
        hours: 6 * multiplier,
      };
    case 'I15M':
      return {
        minutes: 15 * multiplier,
      };
  }
};

const getDifference = (
  interval: PennantInterval,
  dateLeft: Date,
  dateRight: Date
): number => {
  switch (interval) {
    case 'I1D':
      return differenceInDays(dateRight, dateLeft);
    case 'I6H':
      return differenceInHours(dateRight, dateLeft) / 6;
    case 'I1H':
      return differenceInHours(dateRight, dateLeft);
    case 'I15M':
      return differenceInMinutes(dateRight, dateLeft) / 15;
    case 'I5M':
      return differenceInMinutes(dateRight, dateLeft) / 5;
    case 'I1M':
      return differenceInMinutes(dateRight, dateLeft);
  }
};

const checkGranulationContinuity =
  (interval: PennantInterval) =>
  (agg: Candle[], candle: Candle, i: number): Candle[] => {
    if (agg.length && i) {
      const previous = agg[agg.length - 1];
      const difference = getDifference(interval, previous.date, candle.date);
      if (difference > 1) {
        for (let j = 1; j < difference; j++) {
          const duration = getDuration(interval, j);
          const newStartDate = add(previous.date, duration);
          const newParsedCandle: Candle = {
            date: newStartDate,
            high: previous.close,
            low: previous.close,
            open: previous.close,
            close: previous.close,
            volume: 0,
          };
          agg.push(newParsedCandle);
        }
      }
    }
    agg.push(candle);
    return agg;
  };

function parseCandle(
  candle: CandleFieldsFragment,
  decimalPlaces: number,
  positionDecimalPlaces: number
): Candle {
  return {
    date: new Date(candle.periodStart),
    high: Number(addDecimal(candle.high, decimalPlaces)),
    low: Number(addDecimal(candle.low, decimalPlaces)),
    open: Number(addDecimal(candle.open, decimalPlaces)),
    close: Number(addDecimal(candle.close, decimalPlaces)),
    volume: Number(addDecimal(candle.volume, positionDecimalPlaces)),
  };
}

function parseOrder(
  order: AnnotationOrder,
  decimalPlaces: number,
  positionDecimalPlaces: number
): LabelAnnotation {
  const prefix = order ? (order.side === Schema.Side.SIDE_BUY ? '+' : '-') : '';

  const label =
    prefix + addDecimalsFormatNumber(order.size, positionDecimalPlaces);

  let tif = '-';

  if (
    order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
    order?.expiresAt
  ) {
    const expiry = getDateTimeFormat().format(new Date(order.expiresAt));
    tif = `${Schema.OrderTimeInForceCode[order.timeInForce]}: ${expiry}`;
  } else {
    const tifLabel = order.timeInForce
      ? Schema.OrderTimeInForceCode[order.timeInForce]
      : '';

    tif = tifLabel;
  }

  return {
    type: 'label',
    id: order.id,
    cells: [
      { label: order.type ? Schema.OrderTypeMapping[order.type] : '-' },
      {
        label: tif,
      },
      {
        label: addDecimalsFormatNumber(order.price, decimalPlaces),
        numeric: true,
      },
      {
        label: label,
        numeric: true,
        stroke: true,
      },
    ],
    intent: order.side === Schema.Side.SIDE_BUY ? 'success' : 'danger',
    y: Number(addDecimal(order.price, decimalPlaces)),
  };
}
