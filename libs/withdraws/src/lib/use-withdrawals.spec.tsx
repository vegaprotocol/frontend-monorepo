import { WithdrawalStatus } from '@vegaprotocol/types';
import { generateWithdrawal } from './test-helpers';
import { updateQuery } from './use-withdrawals';
import type {
  WithdrawalEvent,
  WithdrawalEvent_busEvents_event_Withdrawal,
} from './__generated__/WithdrawalEvent';
import type {
  Withdrawals,
  Withdrawals_party_withdrawals,
} from './__generated__/Withdrawals';

describe('updateQuery', () => {
  test('Updates existing withdrawals', () => {
    const withdrawal = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.Open,
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.Finalized,
    });
    const prev = mockQuery([withdrawal]);
    const incoming = mockSub([withdrawalUpdate]);

    expect(updateQuery(prev, incoming)).toEqual({
      party: {
        __typename: 'Party',
        id: 'party-id',
        withdrawals: [withdrawalUpdate],
      },
    });
  });

  test('Adds new withdrawals', () => {
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
        withdrawals: [withdrawalUpdate, withdrawal],
      },
    });
  });

  test('Creates new party if not present', () => {
    const withdrawalUpdate = generateWithdrawal({
      id: '2',
    });
    const incoming = mockSub([withdrawalUpdate]);

    expect(updateQuery({ party: null }, incoming)).toEqual({
      party: {
        __typename: 'Party',
        withdrawals: [withdrawalUpdate],
      },
    });
  });

  test('Handles updates and inserts simultaneously', () => {
    const withdrawal1 = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.Open,
    });
    const withdrawal2 = generateWithdrawal({
      id: '2',
    });
    const withdrawalUpdate = generateWithdrawal({
      id: '1',
      status: WithdrawalStatus.Finalized,
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
        withdrawals: [withdrawalUpdate, withdrawalNew, withdrawal2],
      },
    });
  });
});

const mockQuery = (
  withdrawals: Withdrawals_party_withdrawals[]
): Withdrawals => {
  return {
    party: {
      __typename: 'Party',
      id: 'party-id',
      withdrawals,
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
