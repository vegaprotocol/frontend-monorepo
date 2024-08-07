import { fireEvent, render, screen } from '@testing-library/react';

import { type TransactionMessage } from '@/lib/transactions';
import { useConnectionStore } from '@/stores/connections';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { testingNetwork } from '../../../../../config/well-known-networks';
import {
  locators,
  TransactionNotAutoApproved,
} from './auto-approval-notification';

jest.mock('@/stores/connections');

const transaction = {
  orderSubmission: {
    marketId:
      '10c7d40afd910eeac0c2cad186d79cb194090d5d5f13bd31e14c49fd1bded7e2',
    price: '0',
    size: '64',
    side: 'SIDE_SELL',
    timeInForce: 'TIME_IN_FORCE_GTT',
    expiresAt: '1678959957494396062',
    type: 'TYPE_LIMIT',
    reference: 'traderbot',
    peggedOrder: {
      reference: 'PEGGED_REFERENCE_BEST_ASK',
      offset: '15',
    },
  },
};

const details = {
  name: 'Key 1',
  origin: 'https://www.google.com',
  wallet: 'test-wallet',
  sendingMode: 'TYPE_SYNC',
  publicKey: '3fd42fd5ceb22d99ac45086f1d82d516118a5cb7ad9a2e096cd78ca2c8960c80',
  transaction,
  chainId: testingNetwork.chainId,
  receivedAt: new Date('2021-01-01T00:00:00.000Z').toISOString(),
};

const renderComponent = ({ details }: { details: TransactionMessage }) =>
  render(<TransactionNotAutoApproved details={details} />);

describe('TransactionNotAutoApproved', () => {
  it('throws error if the connection could not be found', () => {
    silenceErrors();
    mockStore(useConnectionStore, {
      connections: [],
    });
    expect(() => renderComponent({ details })).toThrow('');
  });
  it('renders nothing if this connection does not have auto approval enabled', () => {
    mockStore(useConnectionStore, {
      connections: [{ origin: details.origin, autoConsent: false }],
    });
    const { container } = renderComponent({ details });
    expect(container).toBeEmptyDOMElement();
  });
  it('renders nothing if the transactions is not able to be auto approved', () => {
    mockStore(useConnectionStore, {
      connections: [{ origin: details.origin, autoConsent: true }],
    });
    const { container } = renderComponent({
      details: {
        ...details,
        transaction: { transfer: {} },
      },
    });
    expect(container).toBeEmptyDOMElement();
  });
  it('renders message and tooltip if the transaction could have been auto approved but was not', async () => {
    mockStore(useConnectionStore, {
      connections: [{ origin: details.origin, autoConsent: true }],
    });
    renderComponent({
      details,
    });
    expect(screen.getByTestId(locators.autoApprovalMessage)).toHaveTextContent(
      'Transaction not automatically confirmed'
    );
    fireEvent.pointerMove(screen.getByTestId(locators.autoApprovalMessage));
    await screen.findByRole('tooltip');
    expect(screen.queryByRole('tooltip')).toHaveTextContent(
      'This transaction was not automatically confirmed because it was received while your wallet was locked.'
    );
  });
});
