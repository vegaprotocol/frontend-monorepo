import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import { MemoryRouter } from 'react-router-dom';
import { Transfer } from './transfer';

jest.mock('@vegaprotocol/accounts', () => ({
  TransferContainer: ({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  ),
}));

jest.mock('../../components/welcome-dialog/get-started.ts', () => ({
  GetStarted: () => <div>GetStarted</div>,
}));

const renderJsx = (route = '/transfer') => {
  render(
    <MockedProvider>
      <MemoryRouter initialEntries={[route]}>
        <Transfer />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('Transfer page', () => {
  it('properly rendered', () => {
    renderJsx();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Transfer' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assetId')).toBeEmptyDOMElement();
  });

  it('assetId should be passed down', async () => {
    const assetId = 'foo';
    const route = '/transfer?assetId=' + assetId;
    renderJsx(route);
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
