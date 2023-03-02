import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PartyLink from './party-link';

describe('PartyLink', () => {
  it('renders Network for 000.000 party', () => {
    const zeroes =
      '0000000000000000000000000000000000000000000000000000000000000000';
    const screen = render(<PartyLink id={zeroes} />);
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('renders Network for network party', () => {
    const screen = render(<PartyLink id="network" />);
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('renders ID with no link for invalid party', () => {
    const screen = render(<PartyLink id="this-party-is-not-valid" />);
    expect(screen.getByTestId('invalid-party')).toBeInTheDocument();
  });

  it('links a valid party to the party page', () => {
    const aValidParty =
      '13464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6e';

    const screen = render(
      <MemoryRouter>
        <PartyLink id={aValidParty} />
      </MemoryRouter>
    );

    const el = screen.getByText(aValidParty);
    expect(el).toBeInTheDocument();
    // The text should be a link that points to the party's page
    expect(el.parentElement?.tagName).toEqual('A');
    expect(el.parentElement?.getAttribute('href')).toContain(aValidParty);
  });
});
