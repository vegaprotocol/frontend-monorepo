import { fireEvent, render, screen } from '@testing-library/react';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import { EthereumError } from '../ethereum-error';
import { EthTxStatus } from '../use-ethereum-transaction';
import type { TransactionDialogProps } from './transaction-dialog';
import { TransactionDialog } from './transaction-dialog';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    chainId: 3,
  }),
}));

let props: TransactionDialogProps;

beforeEach(() => {
  props = {
    name: 'test',
    onChange: jest.fn(),
    transaction: {
      status: EthTxStatus.Default,
      txHash: null,
      error: null,
      confirmations: 1,
      receipt: null,
      dialogOpen: true,
    },
  };
});

const generateJsx = (moreProps?: PartialDeep<TransactionDialogProps>) => {
  const mergedProps = merge(props, moreProps);
  return <TransactionDialog {...mergedProps} />;
};

it('Opens when tx starts and closes if the user rejects the tx', () => {
  const { container, rerender } = render(generateJsx());

  // Dialog closed by default
  expect(container).toBeEmptyDOMElement();

  rerender(generateJsx({ transaction: { status: EthTxStatus.Pending } }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // User rejecting the tx closes the dialog
  rerender(
    generateJsx({
      transaction: {
        status: EthTxStatus.Error,
        error: new EthereumError('User rejected', 4001, 'reason'),
      },
    })
  );

  expect(container).toBeEmptyDOMElement();
});

it('Doesn\t repoen if user dismissed the dialog', () => {
  const { container, rerender } = render(
    generateJsx({ transaction: { status: EthTxStatus.Pending } })
  );

  fireEvent.click(screen.getByTestId('dialog-close'));

  expect(container).toBeEmptyDOMElement();

  rerender(generateJsx({ transaction: { status: EthTxStatus.Complete } }));

  // Should still be closed even though tx updated
  expect(container).toBeEmptyDOMElement();
});

it('Dialog states', () => {
  // Requested
  const { rerender } = render(
    generateJsx({ transaction: { status: EthTxStatus.Requested } })
  );
  expect(screen.getByText('Confirm transaction')).toBeInTheDocument();
  expect(screen.getByText('Confirm transaction in wallet')).toBeInTheDocument();
  expect(screen.getByText('Await Ethereum transaction')).toBeInTheDocument();

  // Pending
  rerender(
    generateJsx({
      transaction: { status: EthTxStatus.Pending, confirmations: 0 },
    })
  );
  expect(screen.getByText(`${props.name} pending`)).toBeInTheDocument();
  expect(screen.getByText('Confirmed in wallet')).toBeInTheDocument();
  expect(
    screen.getByText('Awaiting Ethereum transaction 0/1 confirmations...')
  ).toBeInTheDocument();
  expect(screen.getByTestId('link')).toBeInTheDocument();

  // Ethereum complete
  rerender(
    generateJsx({
      transaction: { status: EthTxStatus.Complete, confirmations: 1 },
    })
  );
  expect(screen.getByText(`${props.name} pending`)).toBeInTheDocument();
  expect(screen.getByText('Confirmed in wallet')).toBeInTheDocument();
  expect(screen.getByText('Ethereum transaction complete')).toBeInTheDocument();

  // Ethereum confirmed (via api)
  rerender(
    generateJsx({
      transaction: {
        status: EthTxStatus.Confirmed,
        error: null,
      },
    })
  );
  expect(screen.getByText(`${props.name} complete`)).toBeInTheDocument();
  expect(screen.getByText('Confirmed in wallet')).toBeInTheDocument();
  expect(screen.getByText('Transaction confirmed')).toBeInTheDocument();

  // Error
  const errorMsg = 'Something went wrong';
  const reason = 'Transaction failed';
  rerender(
    generateJsx({
      transaction: {
        status: EthTxStatus.Error,
        error: new EthereumError(errorMsg, 1, reason),
      },
    })
  );
  expect(screen.getByText(`${props.name} failed`)).toBeInTheDocument();
  expect(screen.getByText(`Error: ${reason}`)).toBeInTheDocument();
});
