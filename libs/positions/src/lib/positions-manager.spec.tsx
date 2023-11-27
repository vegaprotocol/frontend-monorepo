import { render, screen, fireEvent } from '@testing-library/react';
import { PositionsManager } from './positions-manager';
import { positionsMarketsProvider } from './positions-data-providers';
import { singleRow } from './positions.mock';
import { MockedProvider } from '@apollo/client/testing';
import { MAXGOINT64 } from '@vegaprotocol/utils';

const mockCreate = jest.fn();
jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn(() => ({ pubKey: 'partyId' })),
}));
jest.mock('@vegaprotocol/web3', () => ({
  ...jest.requireActual('@vegaprotocol/web3'),
  useVegaTransactionStore: jest.fn(() => mockCreate),
}));
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const mockUseDataProvider = (args: any) => {
  if (args.dataProvider === positionsMarketsProvider) {
    return { data: ['market-1', 'market-2'] };
  }
  return { data: [singleRow] };
};
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((args) => mockUseDataProvider(args)),
}));

describe('PositionsManager', () => {
  // TODO: Close position temporarily disabled in https://github.com/vegaprotocol/frontend-monorepo/pull/5350
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should close position with max uint64', async () => {
    render(<PositionsManager partyIds={['partyId']} isReadOnly={false} />, {
      wrapper: MockedProvider,
    });
    expect(await screen.findByTestId('close-position')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-position'));

    expect(
      mockCreate.mock.lastCall[0].batchMarketInstructions.submissions[0].size
    ).toEqual(MAXGOINT64);
  });
});
