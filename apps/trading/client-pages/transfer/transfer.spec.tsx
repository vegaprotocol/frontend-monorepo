import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Transfer } from './transfer';

jest.mock('@vegaprotocol/accounts', () => ({
  TransferContainer: ({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  ),
}));

jest.mock('../../components/welcome-dialog/get-started', () => ({
  GetStarted: () => <div>GetStarted</div>,
}));

const renderJsx = (route = '/transfer') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Transfer />
    </MemoryRouter>
  );
};

describe('Transfer page', () => {
  it('assetId should be passed down', () => {
    const assetId = 'foo';
    const route = '/transfer?assetId=' + assetId;
    renderJsx(route);
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
