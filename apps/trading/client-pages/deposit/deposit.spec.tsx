import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Deposit } from './deposit';

jest.mock('@vegaprotocol/deposits', () => ({
  DepositContainer: ({ assetId }: { assetId?: string }) => (
    <div data-testid="assetId">{assetId}</div>
  ),
}));

jest.mock('../../components/welcome-dialog/get-started.ts', () => ({
  GetStarted: () => <div>GetStarted</div>,
}));

const renderJsx = (route = '/deposit') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Deposit />
    </MemoryRouter>
  );
};

describe('Deposit page', () => {
  it('assetId should be passed down', () => {
    const assetId = 'foo';
    const route = '/deposit?assetId=' + assetId;
    renderJsx(route);
    expect(screen.getByTestId('assetId')).toHaveTextContent(assetId);
  });
});
