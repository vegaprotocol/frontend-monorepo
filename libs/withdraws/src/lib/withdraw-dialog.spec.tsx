import { render, screen } from '@testing-library/react';
import merge from 'lodash/merge';
import {
  initialState as vegaTxInitialState,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import {
  EthTxStatus,
  initialState as ethTxInitialState,
} from '@vegaprotocol/web3';
import type { WithdrawDialogProps } from './withdraw-dialog';
import { WithdrawDialog } from './withdraw-dialog';
import type { Erc20Approval_erc20WithdrawalApproval } from './__generated__/Erc20Approval';
import type { PartialDeep } from 'type-fest';

const approval: Erc20Approval_erc20WithdrawalApproval = {
  __typename: 'Erc20WithdrawalApproval',
  assetSource: 'asset-source',
  amount: '100',
  nonce: '1',
  signatures: 'signatures',
  targetAddress: 'target-address',
  expiry: 'expiry',
};

const generateJsx = (override?: PartialDeep<WithdrawDialogProps>) => {
  const defaultProps = {
    vegaTx: vegaTxInitialState,
    ethTx: ethTxInitialState,
    approval: null,
    dialogOpen: true,
    onDialogChange: jest.fn(),
  };
  const props = merge(defaultProps, override);
  return <WithdrawDialog {...props} />;
};

it('Dialog transaction states', () => {
  const { rerender } = render(
    generateJsx({
      vegaTx: {
        status: VegaTxStatus.Requested,
      },
    })
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Confirm withdrawal')).toBeInTheDocument();

  rerender(
    generateJsx({
      vegaTx: {
        status: VegaTxStatus.Pending,
      },
    })
  );

  expect(
    screen.getByText('Withdrawal transaction pending')
  ).toBeInTheDocument();

  rerender(
    generateJsx({
      vegaTx: {
        status: VegaTxStatus.Error,
      },
    })
  );
  expect(screen.getByText('Withdrawal transaction failed')).toBeInTheDocument();

  rerender(
    generateJsx({
      approval,
      vegaTx: {
        status: VegaTxStatus.Pending,
      },
      ethTx: {
        status: EthTxStatus.Requested,
      },
    })
  );
  expect(screen.getByText('Confirm transaction')).toBeInTheDocument();

  const txHash = 'tx-hash';
  rerender(
    generateJsx({
      approval,
      ethTx: {
        status: EthTxStatus.Pending,
        txHash,
      },
    })
  );
  expect(screen.getByText('Ethereum transaction pending')).toBeInTheDocument();
  expect(screen.getByText('View on Etherscan')).toHaveAttribute(
    'href',
    expect.stringContaining(txHash)
  );

  rerender(
    generateJsx({
      approval,
      ethTx: {
        status: EthTxStatus.Complete,
      },
    })
  );
  expect(screen.getByText('Ethereum transaction complete')).toBeInTheDocument();
  expect(screen.getByText('View on Etherscan')).toHaveAttribute(
    'href',
    expect.stringContaining(txHash)
  );
});
