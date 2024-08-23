import { render, screen } from '@testing-library/react';
import type { HTMLAttributes } from 'react';
import { MemoryRouter } from 'react-router-dom';

import type { NavButtonProperties } from '.';
import { NavBar, NavButton } from '.';

jest.mock('@vegaprotocol/ui-toolkit', () => ({
  ...jest.requireActual('@vegaprotocol/ui-toolkit'),
  Button: (properties: HTMLAttributes<HTMLButtonElement>) => (
    <button {...properties} />
  ),
}));

const renderNavButton = (
  properties: NavButtonProperties,
  initialEntries: string[] = []
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <NavButton {...properties} />
    </MemoryRouter>
  );

const renderNav = () =>
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

describe('NavButton', () => {
  it('renders with text and icon', () => {
    const icon = <svg data-testid="test-icon" />;
    renderNavButton(
      {
        icon: icon,
        text: 'Test Button',
        to: '/',
      },
      ['/foo']
    );

    expect(screen.getByTestId('nav-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByTestId('link-active')).not.toHaveClass(
      'bg-intent-primary'
    );
  });

  it('renders with active link styles when active', () => {
    const icon = <svg data-testid="test-icon" />;
    renderNavButton(
      {
        icon: icon,
        text: 'Test Button',
        to: '/settings',
      },
      ['/settings']
    );

    expect(screen.getByTestId('link-active')).toHaveClass('bg-intent-primary');
  });
});

describe('NavBar', () => {
  it('renders with all three NavButtons', () => {
    renderNav();
    expect(screen.getByTestId('nav-bar')).toBeInTheDocument();
    expect(screen.getByTestId('nav-bar')).toHaveClass('bg-surface-1');
    expect(screen.getAllByTestId('nav-button')).toHaveLength(3);
    const [wallets, transactions, settings] =
      screen.getAllByTestId('nav-button');
    expect(wallets).toHaveTextContent('Wallets');
    expect(transactions).toHaveTextContent('Transactions');
    expect(settings).toHaveTextContent('Settings');
  });
});
