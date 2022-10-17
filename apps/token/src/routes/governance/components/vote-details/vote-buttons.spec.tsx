import { render, screen, fireEvent } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { VoteButtons } from './vote-buttons';
import { VoteState } from './use-user-vote';
import { ProposalState, VoteValue } from '@vegaprotocol/types';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { mockWalletContext } from '../../test-helpers/mocks';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';

describe('Vote buttons', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(1)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should explain that voting is closed if the proposal is not open', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_PASSED}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(1)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByText('Voting has ended.')).toBeTruthy();
  });

  it('should provide a connect wallet prompt if no pubkey', () => {
    const mockWalletNoPubKeyContext = {
      pubKey: null,
      pubKeys: [],
      sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
      connect: jest.fn(),
      disconnect: jest.fn(),
      selectPubKey: jest.fn(),
      connector: null,
    };

    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletNoPubKeyContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(1)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );

    expect(screen.getByTestId('connect-wallet')).toBeTruthy();
  });

  it('should tell the user they need tokens if their current stake is 0', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(0)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(
      screen.getByText('You need some VEGA tokens to participate in governance')
    ).toBeTruthy();
  });

  it('should tell the user of the minimum requirements if they have some, but not enough tokens', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(1)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(
      screen.getByText(
        'You must have at least 2 VEGA associated to vote on this proposal'
      )
    ).toBeTruthy();
  });

  it('should display vote requested', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.Requested}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('vote-requested')).toBeInTheDocument();
  });

  it('should display vote pending', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.Pending}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('vote-pending')).toBeInTheDocument();
  });

  it('should show you voted if vote state is correct, and if the proposal is still open, it will display a change vote button', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.Yes}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('you-voted')).toBeInTheDocument();
    expect(screen.getByTestId('change-vote-button')).toBeInTheDocument();
  });

  it('should display vote failure', () => {
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.Failed}
            castVote={jest.fn()}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('vote-failure')).toBeInTheDocument();
  });

  it('should cast yes vote when vote-for button is clicked', () => {
    const castVote = jest.fn();
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={castVote}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
    const button = screen.getByTestId('vote-for');
    fireEvent.click(button);
    expect(castVote).toHaveBeenCalledWith(VoteValue.VALUE_YES);
  });

  it('should cast no vote when vote-against button is clicked', () => {
    const castVote = jest.fn();
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.NotCast}
            castVote={castVote}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
    const button = screen.getByTestId('vote-against');
    fireEvent.click(button);
    expect(castVote).toHaveBeenCalledWith(VoteValue.VALUE_NO);
  });

  it('should allow you to change your vote', () => {
    const castVote = jest.fn();
    render(
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteButtons
            voteState={VoteState.No}
            castVote={castVote}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
          />
        </VegaWalletContext.Provider>
      </AppStateProvider>
    );
    fireEvent.click(screen.getByTestId('change-vote-button'));
    fireEvent.click(screen.getByTestId('vote-for'));
    expect(castVote).toHaveBeenCalledWith(VoteValue.VALUE_YES);
  });
});
