import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import type { StopOrderByIdQuery } from './__generated__/Orders';
import { StopOrderByIdDocument } from './__generated__/Orders';
import type { MockedResponse } from '@apollo/client/testing';
import { waitForStopOrder } from './wait-for-stop-order';
import {
  OrderTimeInForce,
  OrderType,
  Side,
  StopOrderStatus,
  StopOrderTriggerDirection,
} from '@vegaprotocol/types';

const stopOrderId =
  'ad427c4f5cb599e73ffb6f0ae371d1e0fcba89b6be2401a06e61cab982668d63';

const stopOrder: StopOrderByIdQuery['stopOrder'] = {
  __typename: 'StopOrder',
  id: stopOrderId,
  ocoLinkId: null,
  expiresAt: null,
  expiryStrategy: null,
  triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
  status: StopOrderStatus.STATUS_PENDING,
  rejectionReason: null,
  createdAt: '2024-03-25T10:18:48.946943Z',
  updatedAt: null,
  partyId: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
  marketId: '00788b763b999ef555ac5da17de155ff4237dd14aa6671a303d1285f27f094f0',
  trigger: {
    __typename: 'StopOrderPrice',
    price: '700000',
  },
  submission: {
    __typename: 'OrderSubmission',
    marketId:
      '00788b763b999ef555ac5da17de155ff4237dd14aa6671a303d1285f27f094f0',
    price: '0',
    size: '1',
    side: Side.SIDE_BUY,
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    expiresAt: null,
    type: OrderType.TYPE_MARKET,
    reference: '',
    peggedOrder: null,
    postOnly: false,
    reduceOnly: true,
  },
};

const mockedStopOrderById: MockedResponse<StopOrderByIdQuery> = {
  request: {
    query: StopOrderByIdDocument,
    variables: { stopOrderId },
  },
  result: {
    data: {
      stopOrder,
    },
  },
};

describe('waitForStopOrder', () => {
  it('resolves with matching stopOrder', async () => {
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new MockLink([mockedStopOrderById]),
    });
    expect(await waitForStopOrder(stopOrderId, client)).toEqual(stopOrder);
  });
});
