import { act, fireEvent, render, screen } from '@testing-library/react';
import merge from 'lodash/merge';
import BigNumber from 'bignumber.js';
import { WithdrawForm } from './withdraw-form';
import type { WithdrawFormProps } from './withdraw-form';
import type { Asset } from './types';
import { addDecimal } from '@vegaprotocol/react-helpers';

const ethereumAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
let props: WithdrawFormProps;

beforeEach(() => {
  const assets = [
    generateAsset(),
    generateAsset({ id: 'asset-id-2', symbol: 'asset-symbol-2' }),
  ];
  props = {
    assets,
    min: new BigNumber(0.00001),
    max: new BigNumber(100),
    ethereumAccount: undefined,
    selectedAsset: undefined,
    onSelectAsset: jest.fn(),
    submitWithdraw: jest.fn().mockReturnValue(Promise.resolve()),
  };
});

const submit = () => {
  fireEvent.submit(screen.getByTestId('withdraw-form'));
};

const generateJsx = (props: WithdrawFormProps) => <WithdrawForm {...props} />;

test('Validation', async () => {
  const { rerender } = render(generateJsx(props));

  await act(async () => {
    submit();
  });

  expect(screen.getAllByRole('alert')).toHaveLength(3);
  expect(screen.getAllByText('Required')).toHaveLength(3);

  // Selected asset state lives in state so rerender with it now selected
  rerender(generateJsx({ ...props, selectedAsset: props.assets[0] }));

  fireEvent.change(screen.getByLabelText('Asset'), {
    target: { value: props.assets[0].id },
  });

  fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
    target: { value: 'invalid-address' },
  });

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '101' },
  });

  await act(async () => {
    submit();
  });

  expect(screen.getByText('Invalid Ethereum address')).toBeInTheDocument();
  expect(screen.getByText('Value is above maximum')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
    target: { value: ethereumAddress },
  });

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '0.000000000001' },
  });

  await act(async () => {
    submit();
  });

  expect(screen.getByText('Value is below minimum')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '40' },
  });

  await act(async () => {
    submit();
  });

  expect(props.submitWithdraw).toHaveBeenCalledWith({
    asset: props.assets[0].id,
    amount: '4000000',
    receiverAddress: ethereumAddress,
  });
});

test('Use max button', () => {
  const asset = props.assets[0];
  render(generateJsx({ ...props, selectedAsset: asset }));

  fireEvent.click(screen.getByText('Use maximum'));

  expect(screen.getByLabelText('Amount')).toHaveValue(
    Number(props.max.toFixed(asset.decimals))
  );
});

test('Use connected Ethereum account', () => {
  render(generateJsx({ ...props, ethereumAccount: ethereumAddress }));

  fireEvent.click(screen.getByText('Use connected'));

  expect(screen.getByLabelText('To (Ethereum address)')).toHaveValue(
    ethereumAddress
  );
});

const generateAsset = (override?: Partial<Asset>) => {
  return merge(
    {
      id: 'asset-id',
      symbol: 'asset-symbol',
      name: 'asset-name',
      decimals: 5,
      source: {
        contractAddress: 'contract-address',
      },
    },
    override
  );
};
