import { fireEvent, render, screen } from '@testing-library/react';

import { RpcMethods } from '@/lib/client-rpc-methods';
import { useConnectionStore } from '@/stores/connections';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { testingNetwork } from '../../../../config/well-known-networks';
import { locators, TransactionModalFooter } from './transaction-modal-footer';

jest.mock('@/stores/connections');
const mockedRequest = jest.fn();

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({ request: mockedRequest }),
}));

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

const data = {
  name: 'Key 1',
  origin: 'https://www.google.com',
  wallet: 'test-wallet',
  sendingMode: 'TYPE_SYNC',
  publicKey: '3fd42fd5ceb22d99ac45086f1d82d516118a5cb7ad9a2e096cd78ca2c8960c80',
  transaction,
  chainId: testingNetwork.chainId,
  receivedAt: new Date('2021-01-01T00:00:00.000Z').toISOString(),
};

const renderComponent = (autoConsent = false) => {
  mockStore(useConnectionStore, {
    connections: [
      {
        origin: 'https://www.google.com',
        chainId: testingNetwork.chainId,
        networkId: testingNetwork.id,
        autoConsent,
        accessedAt: 0,
        allowList: {
          publicKeys: [],
          wallets: ['test-wallet'],
        },
      },
    ],
    loadConnections: jest.fn(),
  });
  const function_ = jest.fn();
  const view = render(
    <TransactionModalFooter
      details={data}
      handleTransactionDecision={function_}
    />
  );
  return {
    view,
    fn: function_,
  };
};

describe('TransactionModalFooter', () => {
  it('throws error if connection could not be found', () => {
    silenceErrors();
    mockStore(useConnectionStore, {
      connections: [],
      loadConnections: jest.fn(),
    });
    const function_ = jest.fn();
    expect(() =>
      render(
        <TransactionModalFooter
          details={data}
          handleTransactionDecision={function_}
        />
      )
    ).toThrow('Could not find connection with origin https://www.google.com');
  });
  it('renders approve and deny buttons', async () => {
    renderComponent();
    expect(
      screen.getByTestId(locators.transactionModalApproveButton)
    ).toBeVisible();
    expect(
      screen.getByTestId(locators.transactionModalDenyButton)
    ).toBeVisible();
  });

  it('calls handleTransactionDecision with false if rejecting', async () => {
    const { fn } = renderComponent();
    fireEvent.click(screen.getByTestId(locators.transactionModalDenyButton));
    expect(fn).toHaveBeenCalledWith(false);
  });

  it('calls handleTransactionDecision with false if approving', async () => {
    const { fn } = renderComponent();
    fireEvent.click(screen.getByTestId(locators.transactionModalApproveButton));
    expect(fn).toHaveBeenCalledWith(true);
  });
  it('renders auto consent checkbox if autoConsent is false', async () => {
    renderComponent();
    expect(
      screen.getByTestId(locators.transactionModalFooterAutoConsentSection)
    ).toBeVisible();
  });
  it('does not render auto consent checkbox if autoConsent is true', async () => {
    renderComponent(true);
    expect(
      screen.queryByTestId(locators.transactionModalFooterAutoConsentSection)
    ).toBeNull();
  });
  it('sets the auto consent value when it changes', async () => {
    expect(mockedRequest).not.toHaveBeenCalled();
    renderComponent();
    fireEvent.click(
      screen.getByLabelText(
        'Allow this site to automatically approve order and vote transactions. This can be turned off in "Connections".'
      )
    );
    fireEvent.click(screen.getByTestId(locators.transactionModalApproveButton));
    expect(mockedRequest).toHaveBeenCalledWith(
      RpcMethods.UpdateAutomaticConsent,
      {
        origin: 'https://www.google.com',
        autoConsent: true,
      }
    );
  });
});
