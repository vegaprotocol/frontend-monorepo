import { fireEvent, render, screen } from '@testing-library/react';

import { useAsyncAction } from '@/hooks/async-action';
import { useInteractionStore } from '@/stores/interaction-store';
import { mockStore } from '@/test-helpers/mock-store';

import { CheckTransaction, locators } from './check-transaction';

jest.mock('@/stores/interaction-store');
jest.mock('@/hooks/async-action');

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: jest.fn(),
  }),
}));

const renderComponent = () => {
  const checkTransaction = jest.fn();
  mockStore(useInteractionStore, { checkTransaction });
  const view = render(
    <CheckTransaction publicKey="publicKey" origin="origin" transaction={{}} />
  );
  return {
    view,
    checkTransaction,
  };
};

const mockResult = (value: ReturnType<typeof useAsyncAction>) => {
  (useAsyncAction as jest.Mock).mockReturnValue(value);
};

describe('CheckTransaction', () => {
  it('should call checkTransaction function on load', () => {
    (useAsyncAction as unknown as jest.Mock).mockImplementation(
      (function_) => ({
        loading: false,
        error: null,
        data: null,
        loaderFunction: function_,
      })
    );
    const { checkTransaction } = renderComponent();
    expect(checkTransaction).toHaveBeenCalled();
  });
  it('should render a loading state while loading', () => {
    // 1149-CHTX-001 I can see a loading indicator for while we are checking the transaction validity
    mockResult({
      loading: true,
      error: null,
      data: null,
      loaderFunction: jest.fn(),
    });
    renderComponent();
    expect(
      screen.getByTestId(locators.checkTransactionLoading)
    ).toHaveTextContent('Checking transaction validity');
  });
  it('should render a loading state while data is undefined', () => {
    mockResult({
      loading: false,
      error: null,
      data: null,
      loaderFunction: jest.fn(),
    });
    renderComponent();
    expect(
      screen.getByTestId(locators.checkTransactionLoading)
    ).toHaveTextContent('Checking transaction validity');
  });
  it('should render a notification with intent Danger when there is an unexpected error', async () => {
    // 1149-CHTX-002 I can see an error explaining that we were unable to verify the validity of the transaction if an unexpected error occurs
    mockResult({
      loading: false,
      error: new Error('Unexpected error'),
      data: null,
      loaderFunction: jest.fn(),
    });
    renderComponent();
    expect(
      screen.getByTestId(locators.checkTransactionError)
    ).toHaveTextContent(
      "There was a problem checking your transaction's validity, but you can still choose to send it."
    );
    fireEvent.pointerMove(screen.getByTestId(locators.checkTransactionError));
    const [tooltip] = await screen.findAllByTestId(
      locators.checkTransactionErrorTooltip
    );
    expect(tooltip).toHaveTextContent('Unexpected error');
  });
  it('should render a Notification with intent Success when data.valid is true', async () => {
    // 1149-CHTX-003 I can see a success notification when the transaction is valid
    // 1149-CHTX-004 When the transaction is valid, I can see an explanation that this is not a guaranteeing the success of the tx
    mockResult({
      loading: false,
      error: null,
      data: {
        valid: true,
      },
      loaderFunction: jest.fn(),
    });
    renderComponent();
    expect(
      screen.getByTestId(locators.checkTransactionValid)
    ).toHaveTextContent('Your transaction is valid.');
    fireEvent.pointerMove(screen.getByTestId(locators.checkTransactionValid));
    const [tooltip] = await screen.findAllByTestId(
      locators.checkTransactionValidTooltip
    );
    expect(tooltip).toHaveTextContent(
      'This transaction has passed initial checks and is ready to be sent to the network.'
    );
  });
  it('should render a Notification with intent Danger when data.valid is false', async () => {
    // 1149-CHTX-005 I can see an error notification when the transaction is invalid
    // 1149-CHTX-006 When the transaction is invalid I can see the error from the API
    // 1149-CHTX-007 When the transaction is invalid I can see an explanation about what this means
    mockResult({
      loading: false,
      error: null,
      data: {
        valid: false,
        error: 'Error message',
      },
      loaderFunction: jest.fn(),
    });
    renderComponent();
    expect(
      screen.getByTestId(locators.checkTransactionFailed)
    ).toHaveTextContent('Error message');
    fireEvent.pointerMove(screen.getByTestId(locators.checkTransactionFailed));
    const [tooltip] = await screen.findAllByTestId(
      locators.checkTransactionFailedTooltip
    );
    expect(tooltip).toHaveTextContent(
      'You can still send this transaction but it may be rejected by the network.'
    );
  });
});
