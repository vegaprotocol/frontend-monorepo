import { act, fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import { WithdrawForm } from './withdraw-form';
import { generateAsset } from './test-helpers';
import type { WithdrawFormProps } from './withdraw-form';
import type { Asset } from '@vegaprotocol/assets';
import { type AssetData, toAssetData } from '@vegaprotocol/web3';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

jest.mock('@web3-react/core');

jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useAccountBalance: jest.fn(() => ({ accountBalance: 0, accountDecimals: 0 })),
}));

const MOCK_ETH_ADDRESS = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';

let assets: Asset[];
let props: WithdrawFormProps;

beforeEach(() => {
  assets = [
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
    balance: new BigNumber(100),
    threshold: new BigNumber(200),
    delay: 100,
    selectedAsset: undefined,
    onSelectAsset: jest.fn(),
    submitWithdraw: jest.fn().mockReturnValue(Promise.resolve()),
  };
  (useWeb3React as jest.Mock).mockReturnValue({
    account: MOCK_ETH_ADDRESS,
    chainId: 1,
    isActive: true,
  });
});

describe('Withdrawal form', () => {
  it('renders with default values', async () => {
    render(<WithdrawForm {...props} />);

    expect(screen.getByLabelText('Asset')).toHaveValue('');
    expect(screen.getByTestId('ethereum-address')).toHaveTextContent(
      truncateMiddle(MOCK_ETH_ADDRESS)
    );
    expect(screen.getByLabelText('Amount')).toHaveValue(null);
  });

  describe('field validation', () => {
    it('fails when submitted with empty required fields', async () => {
      render(<WithdrawForm {...props} />);

      fireEvent.submit(screen.getByTestId('withdraw-form'));

      expect(await screen.findAllByRole('alert')).toHaveLength(2);
      expect(screen.getAllByText('Required')).toHaveLength(2);
    });

    it('fails when submitted with invalid ethereum address', async () => {
      (useWeb3React as jest.Mock).mockReturnValue({ account: '123' });
      const asset = toAssetData(props.assets[0]) as AssetData;
      expect(asset).not.toBeNull();
      render(<WithdrawForm {...props} selectedAsset={asset} />);

      fireEvent.change(screen.getByLabelText('Asset'), {
        target: { value: props.assets[0].id },
      });

      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: '101' },
      });

      fireEvent.submit(screen.getByTestId('withdraw-form'));

      expect(
        await screen.findByText('Invalid Ethereum address')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Insufficient amount in account')
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is less than the minimum limit', async () => {
      const asset = toAssetData(props.assets[0]) as AssetData;
      expect(asset).not.toBeNull();

      render(<WithdrawForm {...props} selectedAsset={asset} />);

      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: '0.000000000001' },
      });

      fireEvent.submit(screen.getByTestId('withdraw-form'));

      expect(
        await screen.findByText('Value is below minimum')
      ).toBeInTheDocument();
    });

    it('passes validation with correct field values', async () => {
      const asset = toAssetData(props.assets[0]) as AssetData;
      expect(asset).not.toBeNull();
      render(<WithdrawForm {...props} selectedAsset={asset} />);

      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: '40' },
      });

      await act(async () => {
        fireEvent.submit(screen.getByTestId('withdraw-form'));
      });

      expect(props.submitWithdraw).toHaveBeenCalledWith({
        asset: props.assets[0].id,
        amount: '4000000',
        receiverAddress: MOCK_ETH_ADDRESS,
        availableTimestamp: null,
      });
    });
  });

  it('populates amount field with balance value when clicking the "use maximum" button', () => {
    const asset = toAssetData(props.assets[0]) as AssetData;
    expect(asset).not.toBeNull();

    render(<WithdrawForm {...props} selectedAsset={asset} />);

    fireEvent.click(screen.getByText('Use maximum'));

    expect(screen.getByLabelText('Amount')).toHaveValue(
      Number(props.balance.toFixed(asset.decimals))
    );
  });
});
