import { fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { VoteButtons } from './vote-buttons';
import { VoteState } from './use-user-vote';
import { ProposalState } from '@vegaprotocol/types';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { mockWalletContext } from '../../test-helpers/mocks';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { MockedProvider } from '@apollo/react-testing';

describe('Vote buttons', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <VoteButtons
              voteState={VoteState.NotCast}
              voteDatetime={null}
              proposalState={ProposalState.STATE_OPEN}
              proposalId={null}
              minVoterBalance={null}
              spamProtectionMinTokens={null}
              currentStakeAvailable={new BigNumber(1)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should explain that voting is closed if the proposal is not open', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <VoteButtons
              voteState={VoteState.NotCast}
              voteDatetime={null}
              proposalState={ProposalState.STATE_PASSED}
              proposalId={null}
              minVoterBalance={null}
              spamProtectionMinTokens={null}
              currentStakeAvailable={new BigNumber(1)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );
    expect(screen.getByText('Voting has ended.')).toBeTruthy();
  });

  it('should provide a connect wallet prompt if no pubkey', () => {
    const mockWalletNoPubKeyContext = {
      pubKey: null,
      pubKeys: [],
      isReadOnly: false,
      sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
      connect: jest.fn(),
      disconnect: jest.fn(),
      selectPubKey: jest.fn(),
      connector: null,
    } as unknown as VegaWalletContextShape;

    render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletNoPubKeyContext}>
            <VoteButtons
              voteState={VoteState.NotCast}
              voteDatetime={null}
              proposalState={ProposalState.STATE_OPEN}
              proposalId={null}
              minVoterBalance={null}
              spamProtectionMinTokens={null}
              currentStakeAvailable={new BigNumber(1)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );

    expect(screen.getByTestId('connect-wallet')).toBeTruthy();
  });

  it('should tell the user they need tokens if their current stake is 0', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <VoteButtons
              voteState={VoteState.NotCast}
              voteDatetime={null}
              proposalState={ProposalState.STATE_OPEN}
              proposalId={null}
              minVoterBalance={null}
              spamProtectionMinTokens={null}
              currentStakeAvailable={new BigNumber(0)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );
    expect(
      screen.getByText(
        'You need some VEGA tokens to participate in governance.'
      )
    ).toBeTruthy();
  });

  it('should tell the user of the minimum requirements if they have some, but not enough tokens', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <VoteButtons
              voteState={VoteState.NotCast}
              voteDatetime={null}
              proposalState={ProposalState.STATE_OPEN}
              proposalId={null}
              minVoterBalance="2000000000000000000"
              spamProtectionMinTokens="1000000000000000000"
              currentStakeAvailable={new BigNumber(1)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );
    expect(
      screen.getByText(
        'You must have at least 2 VEGA associated to vote on this proposal'
      )
    ).toBeTruthy();
  });

  it('should show you voted if vote state is correct, and if the proposal is still open, it will display a change vote button', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <VoteButtons
              voteState={VoteState.Yes}
              voteDatetime={null}
              proposalState={ProposalState.STATE_OPEN}
              proposalId={null}
              minVoterBalance="2000000000000000000"
              spamProtectionMinTokens="1000000000000000000"
              currentStakeAvailable={new BigNumber(10)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('you-voted')).toBeInTheDocument();
    expect(screen.getByTestId('change-vote-button')).toBeInTheDocument();
  });

  it('should allow you to change your vote', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <VoteButtons
              voteState={VoteState.No}
              voteDatetime={null}
              proposalState={ProposalState.STATE_OPEN}
              proposalId={null}
              minVoterBalance="2000000000000000000"
              spamProtectionMinTokens="1000000000000000000"
              currentStakeAvailable={new BigNumber(10)}
              dialog={() => <div>Blah</div>}
              submit={() => Promise.resolve()}
              transaction={null}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </AppStateProvider>
    );
    fireEvent.click(screen.getByTestId('change-vote-button'));
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
  });
});
