import { render, fireEvent } from '@testing-library/react';
import { ProposalMarketChanges } from './proposal-market-changes';

describe('ProposalMarketChanges', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <ProposalMarketChanges left={{}} right={{}} />
    );
    expect(getByTestId('proposal-market-changes')).toBeInTheDocument();
  });

  it('JsonDiff is not visible when showChanges is false', () => {
    const { queryByTestId } = render(
      <ProposalMarketChanges left={{}} right={{}} />
    );
    expect(queryByTestId('json-diff')).not.toBeInTheDocument();
  });

  it('JsonDiff is visible when showChanges is true', async () => {
    const { getByTestId } = render(
      <ProposalMarketChanges left={{}} right={{}} />
    );
    fireEvent.click(getByTestId('proposal-description-toggle'));
    expect(getByTestId('json-diff')).toBeInTheDocument();
  });
});
