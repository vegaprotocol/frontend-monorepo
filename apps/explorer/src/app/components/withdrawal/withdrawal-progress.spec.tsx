import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import WithdrawalProgress from './withdrawal-progress';
import { ExplorerWithdrawalDocument } from './__generated__/Withdrawal';
import { ApolloError } from '@apollo/client';

function renderComponent(id: string, status: number, mock: MockedResponse[]) {
  return (
    <MockedProvider mocks={mock}>
      <WithdrawalProgress id={id} txStatus={status} />
    </MockedProvider>
  );
}

describe('Withdrawal Progress component', () => {
  const mock = {
    request: {
      query: ExplorerWithdrawalDocument,
      variables: {
        id: '123',
      },
    },
    result: {
      data: {
        withdrawal: {
          __typename: 'Withdrawal',
          id: '123',
          status: 'STATUS_OPEN',
          createdTimestamp: '2022-03-24T11:03:40.026173466Z',
          withdrawnTimestamp: null,
          ref: 'irrelevant',
          txHash: '0x123456890',
          details: {
            __typename: 'Erc20WithdrawalDetails',
            receiverAddress: '0x5435345432342423',
          },
        },
      },
    },
  };

  it('Renders success for the first indicator if txStatus is 0', () => {
    const res = render(renderComponent('123', 0, [mock]));
    expect(res.getByText('Requested')).toBeInTheDocument();

    // Steps 2 and three should not be complete also
    expect(res.getByText('Not prepared')).toBeInTheDocument();
    expect(res.getByText('Not complete')).toBeInTheDocument();
  });

  it('Renders success for the first indicator if txStatus is anything except 0', () => {
    const res = render(renderComponent('123', 20, [mock]));
    expect(res.getByText('Rejected')).toBeInTheDocument();

    // Steps 2 and three should not be complete also
    expect(res.getByText('Not prepared')).toBeInTheDocument();
    expect(res.getByText('Not complete')).toBeInTheDocument();
  });

  it('Renders success for the second indicator if a date can be fetched', async () => {
    const res = render(renderComponent('123', 0, [mock]));
    // Step 1 should be filled in
    expect(res.getByText('Requested')).toBeInTheDocument();

    // Step 2
    expect(await res.findByText('Prepared')).toBeInTheDocument();

    // Step 3
    expect(await res.findByText('Not complete')).toBeInTheDocument();
  });

  it('Renders success for the third indicator if the withdrawal has been executed', async () => {
    const mock = {
      request: {
        query: ExplorerWithdrawalDocument,
        variables: {
          id: '123',
        },
      },
      result: {
        data: {
          withdrawal: {
            __typename: 'Withdrawal',
            id: '123',
            status: 'STATUS_FINALIZED',
            createdTimestamp: '2022-03-24T11:03:40.026173466Z',
            withdrawnTimestamp: '2022-03-24T11:03:40.026173466Z',
            ref: 'irrelevant',
            txHash: '0x123456890',
            details: {
              __typename: 'Erc20WithdrawalDetails',
              receiverAddress: '0x5435345432342423',
            },
          },
        },
      },
    };

    const res = render(renderComponent('123', 0, [mock]));
    // Step 1 should be filled in
    expect(res.getByText('Requested')).toBeInTheDocument();

    // Step 2
    expect(await res.findByText('Prepared')).toBeInTheDocument();

    // Step 3
    expect(await res.findByText('Complete')).toBeInTheDocument();
  });

  it('Renders an error under step 2 if the tx status code is ok but there is a graphql error', async () => {
    const mock = {
      request: {
        query: ExplorerWithdrawalDocument,
        variables: {
          id: '123',
        },
      },
      error: new ApolloError({ errorMessage: 'No such withdrawal' }),
    };

    const res = render(renderComponent('123', 0, [mock]));
    expect(await res.findByText('No such withdrawal')).toBeInTheDocument();
  });
});
