import { fireEvent, render, screen } from '@testing-library/react';
import { generateAccount, generateAsset } from './test-helpers';
import type { WithdrawManagerProps } from './withdraw-manager';
import { WithdrawManager } from './withdraw-manager';
import * as withdrawHook from './use-withdraw';
import { initialState as vegaTxInitialState } from '@vegaprotocol/wallet';
import {
  EthereumError,
  EthTxStatus,
  initialState as ethTxInitialState,
} from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';

const ethereumAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ account: ethereumAddress }),
}));

jest.mock('./use-get-withdraw-limits', () => ({
  useGetWithdrawLimits: () => {
    return { max: new BigNumber(1000000) };
  },
}));

let props: WithdrawManagerProps;
let useWithdrawValue: ReturnType<typeof withdrawHook.useWithdraw>;
let useWithdraw: jest.SpyInstance;
let mockSubmit: jest.Mock;
let mockReset: jest.Mock;

beforeEach(() => {
  props = {
    assets: [generateAsset()],
    accounts: [generateAccount()],
    initialAssetId: undefined,
    isNewContract: true,
  };
  mockSubmit = jest.fn();
  mockReset = jest.fn();
  useWithdrawValue = {
    ethTx: ethTxInitialState,
    vegaTx: vegaTxInitialState,
    approval: null,
    withdrawalId: null,
    submit: mockSubmit,
    reset: mockReset,
  };
  useWithdraw = jest
    .spyOn(withdrawHook, 'useWithdraw')
    .mockReturnValue(useWithdrawValue);
});

const generateJsx = (props: WithdrawManagerProps) => (
  <WithdrawManager {...props} />
);

it('Valid form submission opens transaction dialog', async () => {
  render(generateJsx(props));
  submitValid();
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(mockReset).toHaveBeenCalled();
  expect(mockSubmit).toHaveBeenCalledWith({
    amount: '1000',
    asset: props.assets[0].id,
    receiverAddress: ethereumAddress,
  });
});

it('Expected Ethereum error closes the dialog', async () => {
  const { rerender } = render(generateJsx(props));
  submitValid();
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  useWithdraw.mockReturnValue({
    ...useWithdrawValue,
    ethTx: {
      ...useWithdrawValue.ethTx,
      status: EthTxStatus.Error,
      error: new EthereumError('User rejected transaction', 4001),
    },
  });
  rerender(generateJsx(props));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('Correct min max values provided to form', async () => {
  render(generateJsx(props));

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
  expect(mockSubmit).not.toBeCalled();

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
  expect(mockSubmit).not.toBeCalled();
});

it('Initial asset id can preselect asset', async () => {
  const asset = props.assets[0];
  render(generateJsx({ ...props, initialAssetId: asset.id }));
  expect(screen.getByLabelText('Asset')).toHaveValue(asset.id);
});

const submitValid = () => {
  fireEvent.change(screen.getByLabelText('Asset'), {
    target: { value: props.assets[0].id },
  });
  fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
    target: { value: ethereumAddress },
  });
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '0.01' },
  });
  fireEvent.submit(screen.getByTestId('withdraw-form'));
};
