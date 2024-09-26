import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as subHeaderLocators } from '@/components/sub-header';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { FULL_ROUTES } from '@/routes/route-names';
import { type StoredTransaction, TransactionState } from '@/types/backend';

import { testingNetwork } from '../../../../../config/well-known-networks';
import { locators, TransactionMetadata } from './transaction-metadata';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

jest.mock('../transactions-state', () => ({
  VegaTransactionState: () => <div data-testid="transaction-state" />,
}));

const renderComponent = (transaction: StoredTransaction) => {
  render(
    <MemoryRouter>
      <MockNetworkProvider>
        <TooltipProvider>
          <TransactionMetadata transaction={transaction} />
        </TooltipProvider>
      </MockNetworkProvider>
    </MemoryRouter>
  );
};

const mockTransaction = {
  publicKey: '0'.repeat(64),
  id: '1',
  transaction: { transfer: {} },
  sendingMode: 'SYNC',
  keyName: 'Key 1',
  walletName: 'Wallet 1',
  origin: 'https://foo.com',
  receivedAt: new Date(0).toISOString(),
  networkId: testingNetwork.id,
  chainId: testingNetwork.chainId,
  decision: new Date(0).toISOString(),
  state: TransactionState.Confirmed,
  node: 'https://node.com',
  autoApproved: false,
  error: undefined,
  hash: '0'.repeat(64),
  code: undefined,
};

describe('TransactionMeta', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('renders transaction state, subheader and all metadata', () => {
    // 1147-TXDT-001 I can see the status of the transaction
    // 1147-TXDT-003 I can see meta data relating to the transaction, sending key, tx hash if present, network, node used, origin and when the transaction was sent
    // 1147-TXDT-004 I can see links to the explorer for the sending key and transaction hash
    // 1147-TXDT-005 I can see a link to the networks page
    // 1147-TXDT-006 I can see a link to the sending website

    renderComponent(mockTransaction);
    expect(screen.getByTestId('transaction-state')).toBeInTheDocument();
    expect(screen.getByTestId(subHeaderLocators.subHeader)).toHaveTextContent(
      'Transaction Details'
    );

    expect(
      screen.getByTestId(locators.transactionMetadataPublicKey)
    ).toHaveTextContent('000000…0000');
    expect(
      screen.getByTestId(locators.transactionMetadataHash)
    ).toHaveTextContent('000000…0000');

    expect(
      screen.getByTestId(locators.transactionMetadataNetwork)
    ).toHaveTextContent(testingNetwork.id);
    expect(
      screen.getByTestId(locators.transactionMetadataNetwork)
    ).toHaveAttribute(
      'href',
      `${FULL_ROUTES.networksSettings}/${testingNetwork.id}`
    );

    expect(
      screen.getByTestId(locators.transactionMetadataNode)
    ).toHaveTextContent('https://node.com');
    expect(
      screen.getByTestId(locators.transactionMetadataNode)
    ).toHaveAttribute('href', 'https://node.com');

    expect(
      screen.getByTestId(locators.transactionMetadataOrigin)
    ).toHaveTextContent('https://foo.com');
    expect(
      screen.getByTestId(locators.transactionMetadataOrigin)
    ).toHaveAttribute('href', 'https://foo.com');

    // TODO: Set explicit date format for tests
    // expect(
    //   screen.getByTestId(locators.transactionMetadataSent)
    // ).toHaveTextContent('1/1/1970, 12:00:00 AM');
  });

  it('shows error if there is error present', () => {
    // 1147-TXDT-002 If there is an error I can see the error is present
    const tx = {
      ...mockTransaction,
      error: 'Some error',
    };
    renderComponent(tx);
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('handles no transaction hash', () => {
    const tx = {
      ...mockTransaction,
      hash: undefined,
    };
    renderComponent(tx);
    expect(
      screen.queryByTestId(locators.transactionMetadataHash)
    ).not.toBeInTheDocument();
  });
});
