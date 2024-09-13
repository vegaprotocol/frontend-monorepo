import { fireEvent, render, screen } from '@testing-library/react';

import { silenceErrors } from '@/test-helpers/silence-errors';

import { testingNetwork } from '../../../../config/well-known-networks';
import { locators, TransactionModalFooter } from './transaction-modal-footer';
import { mockStore } from '@/test-helpers/mock-store';
import { useGlobalsStore } from '@/stores/globals';

const mockedRequest = jest.fn();

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({ request: mockedRequest }),
}));
jest.mock('@/stores/globals');

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
  mockStore(useGlobalsStore, {
    globals: {
      settings: {
        autoConsent: false,
      },
    },
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
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('throws error if connection could not be found', () => {
    silenceErrors();
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
});
