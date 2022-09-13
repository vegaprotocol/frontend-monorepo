import { Schema } from '@vegaprotocol/types';
import { generateWithdrawal } from './test-helpers';
import { updateQuery } from './use-withdrawals';
import type {
  WithdrawalsQuery,
  WithdrawalEventSubscription,
  WithdrawalFieldsFragment,
} from './__generated__/Withdrawal';

describe('updateQuery', () => {
  it('updates existing withdrawals', () => {
    const withdrawal = generateWithdrawal({
      id: '1',
      status: Schema.WithdrawalStatus.STATUS_OPEN,
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '1',
      status: Schema.WithdrawalStatus.STATUS_FINALIZED,
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

  it('creates new party if not present', () => {
    const partyId = 'party-id';
    const withdrawalUpdate = generateWithdrawal({
      id: '2',
    });
    const incoming = mockSub([withdrawalUpdate]);

    expect(
      updateQuery({ party: null }, { ...incoming, variables: { partyId } })
    ).toEqual({
      party: {
        __typename: 'Party',
        id: partyId,
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
      status: Schema.WithdrawalStatus.STATUS_OPEN,
    });
    const withdrawal2 = generateWithdrawal({
      id: '2',
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '1',
      status: Schema.WithdrawalStatus.STATUS_FINALIZED,
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
  withdrawals: WithdrawalFieldsFragment[]
): WithdrawalsQuery => {
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
  withdrawals: WithdrawalFieldsFragment[]
): {
  subscriptionData: {
    data: WithdrawalEventSubscription;
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
