import { render, screen } from '@testing-library/react';
import { ProposalDocsLink } from './proposal-docs-link';

describe('Proposal Docs Link', () => {
  it('should render successfully', () => {
    render(<ProposalDocsLink urlPart1="https://test.com" />);
    expect(screen.getByTestId('link')).toBeTruthy();
  });

  it('should display link text', () => {
    render(<ProposalDocsLink urlPart1="https://test.com" />);
    expect(
      screen.getByText('https://test.com/tutorials/proposals')
    ).toBeInTheDocument();
  });
});
