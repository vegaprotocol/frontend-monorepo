import { act, fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { VoteButtons, type VoteButtonsProps } from './vote-buttons';
import { VoteState } from './use-user-vote';
import { ProposalState } from '@vegaprotocol/types';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { MockedProvider } from '@apollo/react-testing';
import { VegaTxStatus } from '@vegaprotocol/proposals';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';

describe('Vote buttons', () => {
  const key = { publicKey: '0x123', name: 'key 1' };
  const transaction = {
    status: VegaTxStatus.Default,
    error: null,
    txHash: null,
    signature: null,
    dialogOpen: false,
  };
  const props = {
    voteState: VoteState.NotCast,
    voteDatetime: null,
    proposalState: ProposalState.STATE_OPEN,
    proposalId: null,
    minVoterBalance: null,
    spamProtectionMinTokens: null,
    currentStakeAvailable: new BigNumber(1),
    submit: () => Promise.resolve(),
    transaction,
  };

  const renderComponent = (testProps?: Partial<VoteButtonsProps>) => {
    return render(
      <AppStateProvider>
        <MockedProvider>
          <MockedWalletProvider>
            <VoteButtons {...props} {...testProps} />
          </MockedWalletProvider>
        </MockedProvider>
      </AppStateProvider>
    );
  };

  beforeEach(() => {
    mockConfig.store.setState({ pubKey: key.publicKey, keys: [key] });
  });

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should explain that voting is closed if the proposal is not open', () => {
    renderComponent({ proposalState: ProposalState.STATE_PASSED });
    expect(screen.getByText('Voting has ended.')).toBeTruthy();
  });

  it('should provide a connect wallet prompt if no pubkey', () => {
    mockConfig.reset();
    renderComponent();
    expect(screen.getByTestId('connect-wallet')).toBeTruthy();
  });

  it('should tell the user they need tokens if their current stake is 0', () => {
    renderComponent({ currentStakeAvailable: new BigNumber(0) });
    expect(
      screen.getByText(
        'You need some VEGA tokens to participate in governance.'
      )
    ).toBeTruthy();
  });

  it('should tell the user of the minimum requirements if they have some, but not enough tokens', () => {
    renderComponent({
      minVoterBalance: '2000000000000000000',
      spamProtectionMinTokens: '1000000000000000000',
    });
    expect(
      screen.getByText(
        'You must have at least 2 VEGA associated to vote on this proposal'
      )
    ).toBeTruthy();
  });

  it('should show you voted if vote state is correct, and if the proposal is still open, it will display a change vote button', () => {
    renderComponent({
      voteState: VoteState.Yes,
      minVoterBalance: '2000000000000000000',
      spamProtectionMinTokens: '1000000000000000000',
      currentStakeAvailable: new BigNumber(10),
    });
    expect(screen.getByTestId('you-voted')).toBeInTheDocument();
    expect(screen.getByTestId('change-vote-button')).toBeInTheDocument();
  });

  it('should allow you to change your vote', () => {
    renderComponent({
      voteState: VoteState.No,
      minVoterBalance: '2000000000000000000',
      spamProtectionMinTokens: '1000000000000000000',
      currentStakeAvailable: new BigNumber(10),
    });
    fireEvent.click(screen.getByTestId('change-vote-button'));
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
  });
});
