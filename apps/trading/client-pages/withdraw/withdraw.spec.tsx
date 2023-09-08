import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Withdraw } from './withdraw';

jest.mock('../../components/withdraw-container', () => ({
  WithdrawContainer: ({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  ),
}));

jest.mock('../../components/welcome-dialog/get-started.ts', () => ({
  GetStarted: () => <div>GetStarted</div>,
}));

const renderJsx = (route = '/withdraw') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Withdraw />
    </MemoryRouter>
  );
};

describe('Withdraw page', () => {
  it('should be properly rendered', async () => {
    renderJsx();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Withdraw' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toBeEmptyDOMElement();
  });

  it('assetId should be passed down', async () => {
    const assetId = 'foo';
    const route = '/withdraw?assetId=' + assetId;
    renderJsx(route);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Withdraw' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
