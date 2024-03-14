import { render, screen } from '@testing-library/react';
import GovernanceLink from './governance-link';

describe('GovernanceLink', () => {
  it('renders the link with the correct text', () => {
    render(<GovernanceLink text="Governance internet website" />);
    const linkElement = screen.getByText('Governance internet website');
    expect(linkElement).toBeInTheDocument();
  });

  it('renders the link with the correct href and sensible default text', () => {
    render(<GovernanceLink />);
    const linkElement = screen.getByText('Governance');
    expect(linkElement).toBeInTheDocument();
  });
});
