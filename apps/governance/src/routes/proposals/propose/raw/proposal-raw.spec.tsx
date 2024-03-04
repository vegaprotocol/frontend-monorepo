import { act, fireEvent, render, screen } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { addHours, getTime } from 'date-fns';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { MockedProvider } from '@apollo/client/testing';
import * as Schema from '@vegaprotocol/types';
import { ProposeRaw } from './propose-raw';
import { ProposalEventDocument } from '@vegaprotocol/proposals';
import type { ProposalEventSubscription } from '@vegaprotocol/proposals';

import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';
import { userRejectedError } from '@vegaprotocol/wallet';

const paramsDelay = 20;

const rawProposalNetworkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NetworkParamsDocument,
  },
  result: {
    data: {
      networkParametersConnection: {
        edges: [
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.asset.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateAsset.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.market.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateMarket.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.freeform.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'spam.protection.proposal.min.tokens',
              value: '1000000000000000000',
            },
          },
        ],
      },
    },
  },
  delay: paramsDelay,
};

describe('Raw proposal form', () => {
  const pubKey = '0x123';
  const mockProposalEvent: MockedResponse<ProposalEventSubscription> = {
    request: {
      query: ProposalEventDocument,
      variables: {
        partyId: pubKey,
      },
    },
    result: {
      data: {
        proposals: {
          __typename: 'Proposal',
          id: '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50',
          reference: 'proposal-reference',
          state: Schema.ProposalState.STATE_OPEN,
          rejectionReason:
            Schema.ProposalRejectionReason.PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE,
          errorDetails: 'error-details',
        },
      },
    },
    delay: 300,
  };
  const setup = () => {
    return render(
      <AppStateProvider>
        <MockedProvider
          mocks={[rawProposalNetworkParamsQueryMock, mockProposalEvent]}
        >
          <MockedWalletProvider>
            <ProposeRaw />
          </MockedWalletProvider>
        </MockedProvider>
      </AppStateProvider>
    );
  };

  beforeAll(() => {
    jest.useFakeTimers();
    mockConfig.store.setState({ status: 'connected', pubKey: '0x123' });
  });

  afterAll(() => {
    jest.useRealTimers();
    mockConfig.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handles validation', async () => {
    const mockSendTx = jest.spyOn(mockConfig, 'sendTransaction');

    setup();

    expect(await screen.findByTestId('proposal-submit')).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByTestId('proposal-submit'));
    });
    expect(mockSendTx).not.toHaveBeenCalled();

    expect(await screen.findByTestId('input-error-text')).toHaveTextContent(
      'Required'
    );
    await act(async () => {
      fireEvent.change(screen.getByTestId('proposal-data'), {
        target: { value: 'invalid' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('proposal-submit'));
    });
    expect(mockSendTx).not.toHaveBeenCalled();

    expect(await screen.findByTestId('input-error-text')).toHaveTextContent(
      'Must be valid JSON'
    );
  });

  it('sends the transaction', async () => {
    const mockSendTx = jest
      .spyOn(mockConfig, 'sendTransaction')
      .mockReturnValue(
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                transactionHash: 'tx-hash',
                signature:
                  'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909',
                sentAt: new Date().toISOString(),
                receivedAt: new Date().toISOString(),
              }),
            100
          );
        })
      );

    setup();

    await act(async () => {
      jest.advanceTimersByTime(paramsDelay);
    });

    const inputJSON = JSON.stringify({
      rationale: {
        description: 'Update governance.proposal.freeform.minVoterBalance',
        title: 'testing 123',
      },
      terms: {
        updateNetworkParameter: {
          changes: {
            key: 'governance.proposal.freeform.minVoterBalance',
            value: '300',
          },
        },
        closingTimestamp: Math.floor(getTime(addHours(new Date(), 2)) / 1000),
        enactmentTimestamp: Math.floor(getTime(addHours(new Date(), 3)) / 1000),
      },
    });

    fireEvent.change(screen.getByTestId('proposal-data'), {
      target: { value: inputJSON },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('proposal-submit'));
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      publicKey: pubKey,
      sendingMode: 'TYPE_SYNC',
      transaction: {
        proposalSubmission: JSON.parse(inputJSON),
      },
    });

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Confirm transaction in wallet'
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Awaiting network confirmation'
    );

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Proposal submitted'
    );
  });

  it('can be rejected by the user', async () => {
    jest.spyOn(mockConfig, 'sendTransaction').mockReturnValue(
      new Promise((_, reject) => {
        setTimeout(() => reject(userRejectedError()), 100);
      })
    );
    setup();

    await act(async () => {
      jest.advanceTimersByTime(paramsDelay);
    });

    const inputJSON = '{}';

    expect(await screen.findByTestId('proposal-data')).toBeTruthy();

    fireEvent.change(screen.getByTestId('proposal-data'), {
      target: { value: inputJSON },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('proposal-submit'));
    });

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Confirm transaction in wallet'
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
