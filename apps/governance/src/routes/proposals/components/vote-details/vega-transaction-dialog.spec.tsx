import { render, screen } from '@testing-library/react';
import { VoteTransactionDialog } from './vote-transaction-dialog';
import { VoteState } from './use-user-vote';
import { VegaTxStatus } from '@vegaprotocol/proposals';

describe('VoteTransactionDialog', () => {
  it('renders with txRequested title when voteState is Requested', () => {
    render(
      <VoteTransactionDialog
        voteState={VoteState.Requested}
        transaction={{
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Requested,
          dialogOpen: true,
        }}
      />
    );

    expect(screen.getByText('txRequested')).toBeInTheDocument();
  });

  it('renders with votePending title when voteState is Pending', () => {
    render(
      <VoteTransactionDialog
        voteState={VoteState.Pending}
        transaction={{
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Pending,
          dialogOpen: true,
        }}
      />
    );

    expect(screen.getByText('votePending')).toBeInTheDocument();
  });

  it('renders with no title when voteState is neither Requested nor Pending', () => {
    render(
      <VoteTransactionDialog
        voteState={VoteState.Yes} // or any other state other than Requested or Pending
        transaction={{
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Complete,
          dialogOpen: true,
        }}
      />
    );

    expect(screen.queryByText('txRequested')).not.toBeInTheDocument();
    expect(screen.queryByText('votePending')).not.toBeInTheDocument();
  });

  it('renders custom error message when voteState is Failed and error message exists', () => {
    render(
      <VoteTransactionDialog
        voteState={VoteState.Failed}
        transaction={{
          error: new Error('Custom error test message'),
          txHash: null,
          signature: null,
          status: VegaTxStatus.Error,
          dialogOpen: true,
        }}
      />
    );

    expect(screen.getByText('Custom error test message')).toBeInTheDocument();
  });

  it('renders default error message when voteState is failed and no error message exists on the tx', () => {
    render(
      <VoteTransactionDialog
        voteState={VoteState.Failed}
        transaction={{
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Complete,
          dialogOpen: true,
        }}
      />
    );

    expect(screen.getByText('voteError')).toBeInTheDocument();
  });

  it('renders default ui (i.e. not error) when not in a failed state', () => {
    render(
      <VoteTransactionDialog
        voteState={VoteState.Yes}
        transaction={{
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Default,
          dialogOpen: true,
        }}
      />
    );

    expect(screen.queryByText('voteError')).not.toBeInTheDocument();
  });
});
