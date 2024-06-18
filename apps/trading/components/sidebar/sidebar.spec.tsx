import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './sidebar';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('@vegaprotocol/deal-ticket', () => ({
  DealTicketContainer: ({ marketId }: { marketId: string }) => (
    <div data-testid="deal-ticket">{marketId}</div>
  ),
}));

jest.mock('@vegaprotocol/markets', () => ({
  MarketInfoAccordionContainer: ({ marketId }: { marketId: string }) => (
    <div data-testid="market-info">{marketId}</div>
  ),
}));

jest.mock('../node-health', () => ({
  NodeHealthContainer: () => <div>NodeHealthContainer</div>,
}));

jest.mock('../asset-card', () => ({
  AssetCard: ({ marketId }: { marketId: string }) => (
    <span data-testid="asset-card">Asset: {marketId}</span>
  ),
}));

jest.mock('../accounts-container', () => ({
  AccountsContainer: () => <div data-testid="accounts-list"></div>,
}));

describe('Sidebar', () => {
  const marketId = 'market-id';

  const renderComponent = () => {
    const user = userEvent.setup();
    const result = render(
      <MemoryRouter initialEntries={[`/markets/${marketId}`]}>
        <Routes>
          <Route path="/markets/:marketId" element={<Sidebar />} />
        </Routes>
      </MemoryRouter>
    );

    return {
      ...result,
      user,
    };
  };

  it('switches between accordion sections', async () => {
    const { user } = renderComponent();
    expect(screen.getByTestId('deal-ticket')).toHaveTextContent(marketId);
    expect(screen.getByText('NodeHealthContainer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Market info' }));

    expect(screen.getByTestId('market-info')).toHaveTextContent(marketId);

    await user.click(screen.getByRole('button', { name: 'Assets' }));

    expect(screen.getByTestId('accounts-list')).toBeInTheDocument();
  });
});
