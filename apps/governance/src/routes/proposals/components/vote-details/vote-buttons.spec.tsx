import { fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { VoteButtons } from './vote-buttons';
import { VoteState } from './use-user-vote';
import { ProposalState } from '@vegaprotocol/types';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { MockedProvider } from '@apollo/react-testing';
import * as walletHooks from '@vegaprotocol/wallet-react';
import { VegaTxStatus } from '@vegaprotocol/proposals';

jest.mock('@vegaprotocol/wallet-react');

// @ts-ignore type wrong after mock
walletHooks.useDialogStore.mockReturnValue(jest.fn());

const key = { publicKey: '0x123', name: 'key 1' };
const transaction = {
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

describe('Vote buttons', () => {
  beforeEach(() => {
    // @ts-ignore wrong type after mock
    walletHooks.useVegaWallet.mockReturnValue({
      status: 'connected',
      pubKey: key.publicKey,
      pubKeys: [key],
      isReadOnly: false,
      sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
      connect: jest.fn(),
      disconnect: jest.fn(),
      selectPubKey: jest.fn(),
    });
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <AppStateProvider>
        <MockedProvider>
          <VoteButtons
            voteState={VoteState.NotCast}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            proposalId={null}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(1)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
        </MockedProvider>
      </AppStateProvider>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should explain that voting is closed if the proposal is not open', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VoteButtons
            voteState={VoteState.NotCast}
            voteDatetime={null}
            proposalState={ProposalState.STATE_PASSED}
            proposalId={null}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(1)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
        </MockedProvider>
      </AppStateProvider>
    );
    expect(screen.getByText('Voting has ended.')).toBeTruthy();
  });

  it('should provide a connect wallet prompt if no pubkey', () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: null,
      pubKeys: [],
      isReadOnly: false,
      sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
      connect: jest.fn(),
      disconnect: jest.fn(),
      selectPubKey: jest.fn(),
    });

    render(
      <AppStateProvider>
        <MockedProvider>
          <VoteButtons
            voteState={VoteState.NotCast}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            proposalId={null}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(1)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
        </MockedProvider>
      </AppStateProvider>
    );

    expect(screen.getByTestId('connect-wallet')).toBeTruthy();
  });

  it('should tell the user they need tokens if their current stake is 0', () => {
    render(
      <AppStateProvider>
        <MockedProvider>
          <VoteButtons
            voteState={VoteState.NotCast}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            proposalId={null}
            minVoterBalance={null}
            spamProtectionMinTokens={null}
            currentStakeAvailable={new BigNumber(0)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
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
          <VoteButtons
            voteState={VoteState.NotCast}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            proposalId={null}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(1)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
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
          <VoteButtons
            voteState={VoteState.Yes}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            proposalId={null}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
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
          <VoteButtons
            voteState={VoteState.No}
            voteDatetime={null}
            proposalState={ProposalState.STATE_OPEN}
            proposalId={null}
            minVoterBalance="2000000000000000000"
            spamProtectionMinTokens="1000000000000000000"
            currentStakeAvailable={new BigNumber(10)}
            submit={() => Promise.resolve()}
            transaction={transaction}
          />
        </MockedProvider>
      </AppStateProvider>
    );
    fireEvent.click(screen.getByTestId('change-vote-button'));
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
  });
});
