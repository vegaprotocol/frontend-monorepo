import { fireEvent, render, screen } from '@testing-library/react';
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
    status: EthTxStatus.Default,
    txHash: null,
    error: null,
    confirmations: 1,
  };
});

const generateJsx = (moreProps?: Partial<TransactionDialogProps>) => {
  return <TransactionDialog {...props} {...moreProps} />;
};

it('Opens when tx starts and closes if the user rejects the tx', () => {
  const { container, rerender } = render(generateJsx());

  // Dialog closed by default
  expect(container).toBeEmptyDOMElement();

  rerender(generateJsx({ status: EthTxStatus.Pending }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // User rejecting the tx closes the dialog
  rerender(
    generateJsx({
      status: EthTxStatus.Error,
      error: new EthereumError('User rejected', 4001),
    })
  );

  expect(container).toBeEmptyDOMElement();
});

it('Doesn\t repoen if user dismissed the dialog', () => {
  const { container, rerender } = render(
    generateJsx({ status: EthTxStatus.Pending })
  );

  fireEvent.click(screen.getByTestId('dialog-close'));

  expect(container).toBeEmptyDOMElement();

  rerender(generateJsx({ status: EthTxStatus.Complete }));

  // Should still be closed even though tx updated
  expect(container).toBeEmptyDOMElement();
});

it('Dialog states', () => {
  const { rerender } = render(generateJsx({ status: EthTxStatus.Requested }));
  expect(screen.getByText('Confirm transaction')).toBeInTheDocument();
  expect(screen.getByText('Confirm transaction in wallet')).toBeInTheDocument();
  expect(screen.getByText('Await Ethereum transaction')).toBeInTheDocument();

  rerender(generateJsx({ status: EthTxStatus.Pending, confirmations: 0 }));
  expect(screen.getByText(`${props.name} pending`)).toBeInTheDocument();
  expect(screen.getByText('Confirmed in wallet')).toBeInTheDocument();
  expect(
    screen.getByText('Awaiting Ethereum transaction 0/1 confirmations...')
  ).toBeInTheDocument();
  expect(screen.getByTestId('etherscan-link')).toBeInTheDocument();

  rerender(generateJsx({ status: EthTxStatus.Complete, confirmations: 1 }));
  expect(screen.getByText(`${props.name} complete`)).toBeInTheDocument();
  expect(screen.getByText('Confirmed in wallet')).toBeInTheDocument();
  expect(screen.getByText('Ethereum transaction complete')).toBeInTheDocument();

  const errorMsg = 'Something went wrong';
  rerender(
    generateJsx({ status: EthTxStatus.Error, error: new Error(errorMsg) })
  );
  expect(screen.getByText(`${props.name} failed`)).toBeInTheDocument();
  expect(screen.getByText(errorMsg)).toBeInTheDocument();
});

it('Success state waits for confirmation event if provided', () => {
  const { rerender } = render(
    generateJsx({ status: EthTxStatus.Complete, confirmed: false })
  );
  expect(screen.getByText(`${props.name} pending`)).toBeInTheDocument();
  expect(screen.getByText('Confirmed in wallet')).toBeInTheDocument();
  expect(screen.getByText('Ethereum transaction complete')).toBeInTheDocument();
  expect(
    screen.getByText('Vega is confirming your transaction...')
  ).toBeInTheDocument();

  // @ts-ignore enforce truthy on confirmation event
  rerender(generateJsx({ confirmed: true, status: EthTxStatus.Complete }));
  expect(
    screen.queryByText('Vega is confirming your transaction...')
  ).not.toBeInTheDocument();
  expect(screen.getByText('Transaction confirmed')).toBeInTheDocument();
});
