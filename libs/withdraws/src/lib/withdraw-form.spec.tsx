import { act, fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { WithdrawForm } from './withdraw-form';
import type { WithdrawFormProps } from './withdraw-form';
import { generateAsset } from './test-helpers';

const ethereumAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
let props: WithdrawFormProps;

beforeEach(() => {
  const assets = [
    generateAsset(),
    generateAsset({
      id: 'asset-id-2',
      symbol: 'asset-symbol-2',
      name: 'asset-name-2',
    }),
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

const generateJsx = (props: WithdrawFormProps) => <WithdrawForm {...props} />;

it('Validation', async () => {
  const { rerender } = render(generateJsx(props));

  fireEvent.submit(screen.getByTestId('withdraw-form'));

  expect(await screen.findAllByRole('alert')).toHaveLength(3);
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

  fireEvent.submit(screen.getByTestId('withdraw-form'));

  expect(
    await screen.findByText('Invalid Ethereum address')
  ).toBeInTheDocument();
  expect(screen.getByText('Value is above maximum')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
    target: { value: ethereumAddress },
  });

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '0.000000000001' },
  });

  fireEvent.submit(screen.getByTestId('withdraw-form'));

  expect(await screen.findByText('Value is below minimum')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '40' },
  });

  await act(async () => {
    fireEvent.submit(screen.getByTestId('withdraw-form'));
  });

  expect(props.submitWithdraw).toHaveBeenCalledWith({
    asset: props.assets[0].id,
    amount: '4000000',
    receiverAddress: ethereumAddress,
  });
});

it('Use max button', () => {
  const asset = props.assets[0];
  render(generateJsx({ ...props, selectedAsset: asset }));

  fireEvent.click(screen.getByText('Use maximum'));

  expect(screen.getByLabelText('Amount')).toHaveValue(
    Number(props.max.toFixed(asset.decimals))
  );
});

it('Use connected Ethereum account', () => {
  render(generateJsx({ ...props, ethereumAccount: ethereumAddress }));

  fireEvent.click(screen.getByText('Use connected'));

  expect(screen.getByLabelText('To (Ethereum address)')).toHaveValue(
    ethereumAddress
  );
});
