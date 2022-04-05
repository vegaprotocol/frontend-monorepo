import { act, fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import type { DepositFormProps } from './deposit-form';
import { DepositForm } from './deposit-form';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import type { Asset } from './deposit-manager';

jest.mock('@vegaprotocol/wallet');
jest.mock('@web3-react/core');

function generateAsset(): Asset {
  return {
    __typename: 'Asset',
    id: 'asset-id',
    symbol: 'asset-symbol',
    name: 'asset-name',
    decimals: 2,
    source: {
      __typename: 'ERC20',
      contractAddress: 'contract-address',
    },
  };
}

let asset: Asset;
let props: DepositFormProps;

beforeEach(() => {
  asset = generateAsset();
  props = {
    assets: [asset],
    selectedAsset: undefined,
    onSelectAsset: jest.fn(),
    available: new BigNumber(5),
    submitApprove: jest.fn(),
    submitDeposit: jest.fn(),
    requestFaucet: jest.fn(),
    limits: {
      min: new BigNumber(0),
      max: new BigNumber(20),
    },
    allowance: new BigNumber(30),
  };
});

test('Form validation', async () => {
  const mockUseVegaWallet = useVegaWallet as jest.Mock;
  mockUseVegaWallet.mockReturnValue({ keypair: null });

  const mockUseWeb3React = useWeb3React as jest.Mock;
  mockUseWeb3React.mockReturnValue({ account: undefined });

  const { rerender } = render(<DepositForm {...props} />);

  // Assert default values (including) from/to provided by useVegaWallet and useWeb3React
  expect(screen.getByLabelText('From (Ethereum address)')).toHaveValue('');
  expect(screen.getByLabelText('Asset')).toHaveValue('');
  expect(screen.getByLabelText('To (Vega key)')).toHaveValue('');
  expect(screen.getByLabelText('Amount')).toHaveValue(null);

  await act(async () => {
    fireEvent.click(
      screen.getByText('Deposit', { selector: '[type="submit"]' })
    );
  });

  expect(props.submitDeposit).not.toHaveBeenCalled();
  const validationMessages = screen.getAllByRole('alert');
  expect(validationMessages).toHaveLength(4);
  validationMessages.forEach((el) => {
    expect(el).toHaveTextContent('Required');
  });

  // Address validation
  const invalidEthereumAddress = '123';
  fireEvent.change(screen.getByLabelText('From (Ethereum address)'), {
    target: { value: invalidEthereumAddress },
  });
  expect(await screen.findByText('Invalid Ethereum address'));

  const invalidVegaKey = 'abc';
  fireEvent.change(screen.getByLabelText('To (Vega key)'), {
    target: { value: invalidVegaKey },
  });
  expect(await screen.findByText('Invalid Vega key'));

  // Max amount validation
  const amountMoreThanAvailable = '11';
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: amountMoreThanAvailable },
  });
  expect(await screen.findByText('Insufficient amount in Ethereum wallet'));

  const amountMoreThanLimit = '21';
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: amountMoreThanLimit },
  });
  expect(await screen.findByText('Amount is above permitted maximum'));

  rerender(
    <DepositForm
      {...props}
      limits={{ min: new BigNumber(0), max: new BigNumber(100) }}
    />
  );

  const amountMoreThanAllowance = '31';
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: amountMoreThanAllowance },
  });
  expect(await screen.findByText('Amount is above approved amount'));

  // Min amount validation
  rerender(<DepositForm {...props} selectedAsset={asset} />); // Rerender with selected asset so we have asset.decimals

  const amountLessThanMinViable = '0.00001';
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: amountLessThanMinViable },
  });
  expect(await screen.findByText('Amount is below permitted minimum'));

  rerender(
    <DepositForm
      {...props}
      limits={{ max: new BigNumber(20), min: new BigNumber(10) }}
    />
  );
  const amountLessThanLimit = '5';
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: amountLessThanLimit },
  });
  expect(await screen.findByText('Amount is below permitted minimum'));
});

test('Approval', () => {
  const mockUseVegaWallet = useVegaWallet as jest.Mock;
  mockUseVegaWallet.mockReturnValue({ keypair: null });

  const mockUseWeb3React = useWeb3React as jest.Mock;
  mockUseWeb3React.mockReturnValue({ account: undefined });

  render(
    <DepositForm
      {...props}
      allowance={new BigNumber(0)}
      selectedAsset={asset}
    />
  );

  fireEvent.click(
    screen.getByText(`Approve ${asset.symbol}`, { selector: '[type="button"]' })
  );

  expect(props.submitApprove).toHaveBeenCalled();
});

test('Deposit', async () => {
  const vegaKey =
    'f8885edfa7ffdb6ed996ca912e9258998e47bf3515c885cf3c63fb56b15de36f';
  const mockUseVegaWallet = useVegaWallet as jest.Mock;
  mockUseVegaWallet.mockReturnValue({ keypair: { pub: vegaKey } });

  const account = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
  const mockUseWeb3React = useWeb3React as jest.Mock;
  mockUseWeb3React.mockReturnValue({ account });

  const limits = {
    min: new BigNumber(10),
    max: new BigNumber(20),
  };

  render(
    <DepositForm
      {...props}
      allowance={new BigNumber(100)}
      available={new BigNumber(50)}
      limits={limits}
      selectedAsset={asset}
    />
  );

  // Check deposit limits are displayed
  expect(
    screen.getByText('Minimum', { selector: 'th' }).nextElementSibling
  ).toHaveTextContent(limits.min.toString());
  expect(
    screen.getByText('Maximum', { selector: 'th' }).nextElementSibling
  ).toHaveTextContent(limits.max.toString());

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '15' },
  });

  await act(async () => {
    fireEvent.click(
      screen.getByText('Deposit', { selector: '[type="submit"]' })
    );
  });

  expect(props.submitDeposit).toHaveBeenCalledWith({
    // @ts-ignore contract address definitely defined
    assetSource: asset.source.contractAddress,
    amount: '1500',
    vegaPublicKey: `0x${vegaKey}`,
  });
});
