import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import type { WithdrawalApprovalQuery } from './__generated__/WithdrawalApproval';
import { WithdrawalApprovalDocument } from './__generated__/WithdrawalApproval';
import type { MockedResponse } from '@apollo/client/testing';
import { waitForWithdrawalApproval } from './wait-for-withdrawal-approval';

const erc20WithdrawalApproval: WithdrawalApprovalQuery['erc20WithdrawalApproval'] =
  {
    __typename: 'Erc20WithdrawalApproval',
    assetSource: 'asset-source',
    amount: '100',
    nonce: '1',
    signatures: 'signatures',
    targetAddress: 'targetAddress',
    creation: '1',
  };

const withdrawalId =
  '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50';

const mockedWithdrawalApproval: MockedResponse<WithdrawalApprovalQuery> = {
  request: {
    query: WithdrawalApprovalDocument,
    variables: { withdrawalId },
  },
  result: {
    data: {
      erc20WithdrawalApproval,
    },
  },
};

describe('waitForWithdrawalApproval', () => {
  it('resolves with matching erc20WithdrawalApproval', async () => {
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new MockLink([mockedWithdrawalApproval]),
    });
    const approval = await waitForWithdrawalApproval(withdrawalId, client);
    expect(await approval).toEqual(erc20WithdrawalApproval);
  });
});
