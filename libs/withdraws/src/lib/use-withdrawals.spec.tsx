import { WithdrawalStatus } from '@vegaprotocol/types';
import { generateWithdrawal } from './test-helpers';
import { updateQuery } from './use-withdrawals';
import type {
  WithdrawalEvent,
  WithdrawalEvent_busEvents_event_Withdrawal,
} from './__generated__/WithdrawalEvent';
import type {
  Withdrawals,
  Withdrawals_party_withdrawalsConnection_edges_node,
} from './__generated__/Withdrawals';

describe('updateQuery', () => {
  it('updates existing withdrawals', () => {
    const withdrawal = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.STATUS_OPEN,
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.STATUS_FINALIZED,
    });
    const prev = mockQuery([withdrawal]);
    const incoming = mockSub([withdrawalUpdate]);

    expect(updateQuery(prev, incoming)).toEqual({
      party: {
        __typename: 'Party',
        id: 'party-id',
        withdrawalsConnection: {
          __typename: 'WithdrawalsConnection',
          edges: [
            {
              __typename: 'WithdrawalEdge',
              node: withdrawalUpdate,
            },
          ],
        },
      },
    });
  });

  it('Adds new withdrawals', () => {
    const withdrawal = generateWithdrawal({
      id: '1',
      amount: '100',
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '2',
      amount: '200',
    });
    const prev = mockQuery([withdrawal]);
    const incoming = mockSub([withdrawalUpdate]);

    expect(updateQuery(prev, incoming)).toEqual({
      party: {
        __typename: 'Party',
        id: 'party-id',
        withdrawalsConnection: {
          __typename: 'WithdrawalsConnection',
          edges: [
            {
              __typename: 'WithdrawalEdge',
              node: withdrawalUpdate,
            },
            {
              __typename: 'WithdrawalEdge',
              node: withdrawal,
            },
          ],
        },
      },
    });
  });

  it('Creates new party if not present', () => {
    const withdrawalUpdate = generateWithdrawal({
      id: '2',
    });
    const incoming = mockSub([withdrawalUpdate]);

    expect(updateQuery({ party: null }, incoming)).toEqual({
      party: {
        __typename: 'Party',
        id: 'party-id',
        withdrawalsConnection: {
          __typename: 'WithdrawalsConnection',
          edges: [
            {
              __typename: 'WithdrawalEdge',
              node: withdrawalUpdate,
            },
          ],
        },
      },
    });
  });

  it('Handles updates and inserts simultaneously', () => {
    const withdrawal1 = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.STATUS_OPEN,
    });
    const withdrawal2 = generateWithdrawal({
      id: '2',
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.STATUS_FINALIZED,
    });
    const withdrawalNew = generateWithdrawal({
      id: '3',
    });

    const prev = mockQuery([withdrawal1, withdrawal2]);
    const incoming = mockSub([withdrawalUpdate, withdrawalNew]);
    expect(updateQuery(prev, incoming)).toEqual({
      party: {
        __typename: 'Party',
        id: 'party-id',
        withdrawalsConnection: {
          __typename: 'WithdrawalsConnection',
          edges: [
            {
              __typename: 'WithdrawalEdge',
              node: withdrawalUpdate,
            },
            {
              __typename: 'WithdrawalEdge',
              node: withdrawalNew,
            },
            {
              __typename: 'WithdrawalEdge',
              node: withdrawal2,
            },
          ],
        },
      },
    });
  });
});

const mockQuery = (
  withdrawals: Withdrawals_party_withdrawalsConnection_edges_node[]
): Withdrawals => {
  return {
    party: {
      __typename: 'Party',
      id: 'party-id',
      withdrawalsConnection: {
        __typename: 'WithdrawalsConnection',
        edges: withdrawals.map((w) => ({
          __typename: 'WithdrawalEdge',
          node: w,
        })),
      },
    },
  };
};

const mockSub = (
  withdrawals: WithdrawalEvent_busEvents_event_Withdrawal[]
): {
  subscriptionData: {
    data: WithdrawalEvent;
  };
} => {
  return {
    subscriptionData: {
      data: {
        busEvents: withdrawals.map((w) => ({
          __typename: 'BusEvent',
          event: w,
        })),
      },
    },
  };
};
