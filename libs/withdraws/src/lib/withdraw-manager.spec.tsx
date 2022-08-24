import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateAccount, generateAsset } from './test-helpers';
import type { WithdrawManagerProps } from './withdraw-manager';
import { WithdrawManager } from './withdraw-manager';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import { MockedProvider } from '@apollo/client/testing';

const ethereumAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ account: ethereumAddress }),
}));

jest.mock('./use-get-withdraw-threshold', () => ({
  useGetWithdrawLimits: () => {
    return { max: new BigNumber(1000000) };
  },
}));

let props: WithdrawManagerProps;

beforeEach(() => {
  props = {
    assets: [generateAsset()],
    accounts: [generateAccount()],
  };
});

const generateJsx = (
  props: WithdrawManagerProps,
  vegaWalletContext: Partial<VegaWalletContextShape>
) => (
  <MockedProvider>
    <VegaWalletContext.Provider
      value={vegaWalletContext as VegaWalletContextShape}
    >
      <WithdrawManager {...props} />
    </VegaWalletContext.Provider>
  </MockedProvider>
);

it('Valid form submission shows the transaction status', async () => {
  const mockSendTx = jest.fn().mockReturnValue(
    Promise.resolve({
      txHash: '0x123',
      tx: {
        signature: {
          value:
            'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909',
        },
      },
    })
  );
  const pubKey = '0x123';
  render(
    // @ts-ignore only need pub field in keypair
    generateJsx(props, { sendTx: mockSendTx, keypair: { pub: pubKey } })
  );
  await act(async () => {
    await submitValid();
  });
  expect(mockSendTx).toHaveBeenCalledWith({
    propagate: true,
    pubKey,
    withdrawSubmission: {
      amount: '1000',
      asset: props.assets[0].id,
      ext: {
        erc20: {
          receiverAddress: ethereumAddress,
        },
      },
    },
  });
  expect(screen.queryByTestId('withdraw-form')).not.toBeInTheDocument();
  expect(screen.getByTestId('Pending')).toBeInTheDocument();
});

it('Correct min max values provided to form', async () => {
  const mockSendTx = jest.fn();
  render(
    // @ts-ignore only need pub field in keypair
    generateJsx(props, { sendTx: mockSendTx, keypair: { pub: '0x123' } })
  );

  // Set other fields to be valid
  fireEvent.change(screen.getByLabelText('Asset'), {
    target: { value: props.assets[0].id },
  });
  fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
    target: { value: ethereumAddress },
  });

  // Min amount
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '0.00000001' },
  });
  fireEvent.submit(screen.getByTestId('withdraw-form'));
  expect(await screen.findByText('Value is below minimum')).toBeInTheDocument();
  expect(mockSendTx).not.toBeCalled();

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '0.00001' },
  });

  // Max amount (balance is 1)
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '2' },
  });
  fireEvent.submit(screen.getByTestId('withdraw-form'));
  expect(
    await screen.findByText('Insufficient amount in account')
  ).toBeInTheDocument();
  expect(mockSendTx).not.toBeCalled();
});

const submitValid = async () => {
  await userEvent.selectOptions(
    screen.getByLabelText('Asset'),
    props.assets[0].id
  );
  fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
    target: { value: ethereumAddress },
  });
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '0.01' },
  });
  fireEvent.submit(screen.getByTestId('withdraw-form'));
};
