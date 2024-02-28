import { render, screen } from '@testing-library/react';
import { PositionsManager } from './positions-manager';
import { positionsMarketsProvider } from './positions-data-providers';
import { singleRow } from './positions.mock';
import { MockedProvider } from '@apollo/client/testing';
import { HALFMAXGOINT64 } from '@vegaprotocol/utils';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';
import userEvent from '@testing-library/user-event';

const key = {
  publicKey: '123',
  name: 'foo',
};
const mockCreate = jest.fn();

jest.mock('@vegaprotocol/web3', () => ({
  ...jest.requireActual('@vegaprotocol/web3'),
  useVegaTransactionStore: jest.fn(() => mockCreate),
}));

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const mockUseDataProvider = (args: any) => {
  if (args.dataProvider === positionsMarketsProvider) {
    return { data: ['market-1', 'market-2'] };
  }
  return { data: [{ ...singleRow, partyId: key.publicKey }] };
};

jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((args) => mockUseDataProvider(args)),
}));

describe('PositionsManager', () => {
  afterEach(() => {
    mockConfig.reset();
  });

  it('should close position with half of max uint64', async () => {
    const user = userEvent.setup();

    mockConfig.store.setState({
      pubKey: key.publicKey,
      keys: [key],
      status: 'connected',
    });

    render(
      <MockedProvider>
        <MockedWalletProvider>
          <PositionsManager partyIds={['partyId']} isReadOnly={false} />
        </MockedWalletProvider>
      </MockedProvider>
    );

    expect(await screen.findByTestId('close-position')).toBeInTheDocument();

    await user.click(screen.getByTestId('close-position'));

    expect(
      mockCreate.mock.lastCall[0].batchMarketInstructions.submissions[0].size
    ).toEqual(HALFMAXGOINT64);
  });
});
