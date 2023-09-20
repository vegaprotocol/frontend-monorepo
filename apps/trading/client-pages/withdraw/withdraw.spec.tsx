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
  it('assetId should be passed down', () => {
    const assetId = 'foo';
    const route = '/withdraw?assetId=' + assetId;
    renderJsx(route);
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
