import { act, fireEvent, render, screen } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  BusEventType,
  ProposalRejectionReason,
  ProposalState,
} from '@vegaprotocol/types';
import { ProposalForm } from './proposal-form';
import { PROPOSAL_EVENT_SUB } from './proposals-hooks';
import type { ProposalEvent } from './proposals-hooks/__generated__/ProposalEvent';

describe('ProposalForm', () => {
  const pubkey = '0x123';
  const mockProposalEvent: MockedResponse<ProposalEvent> = {
    request: {
      query: PROPOSAL_EVENT_SUB,
      variables: {
        partyId: pubkey,
      },
    },
    result: {
      data: {
        busEvents: [
          {
            __typename: 'BusEvent',
            type: BusEventType.Proposal,
            event: {
              __typename: 'Proposal',
              id: '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50',
              reference: 'proposal-reference',
              state: ProposalState.Open,
              rejectionReason: ProposalRejectionReason.CloseTimeTooLate,
              errorDetails: 'error-details',
            },
          },
        ],
      },
    },
    delay: 300,
  };
  const setup = (mockSendTx = jest.fn()) => {
    return render(
      <MockedProvider mocks={[mockProposalEvent]}>
        <VegaWalletContext.Provider
          value={
            {
              keypair: { pub: pubkey },
              sendTx: mockSendTx,
            } as unknown as VegaWalletContextShape
          }
        >
          <ProposalForm />
        </VegaWalletContext.Provider>
      </MockedProvider>
    );
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('handles validation', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve());
    setup(mockSendTx);

    fireEvent.click(screen.getByTestId('proposal-submit'));
    expect(mockSendTx).not.toHaveBeenCalled();

    expect(await screen.findByTestId('input-error-text')).toHaveTextContent(
      'Required'
    );

    fireEvent.change(screen.getByTestId('proposal-data'), {
      target: { value: 'invalid' },
    });

    fireEvent.click(screen.getByTestId('proposal-submit'));
    expect(mockSendTx).not.toHaveBeenCalled();

    expect(await screen.findByTestId('input-error-text')).toHaveTextContent(
      'Must be valid JSON'
    );
  });

  it('sends the transaction', async () => {
    const mockSendTx = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              txHash: 'tx-hash',
              tx: {
                signature: {
                  value:
                    'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909',
                },
              },
            }),
          100
        );
      })
    );
    setup(mockSendTx);

    const inputJSON = '{}';
    fireEvent.change(screen.getByTestId('proposal-data'), {
      target: { value: inputJSON },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('proposal-submit'));
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      propagate: true,
      pubKey: pubkey,
      proposalSubmission: JSON.parse(inputJSON),
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
    const mockSendTx = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => resolve(null), 100);
      })
    );
    setup(mockSendTx);

    const inputJSON = '{}';
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
