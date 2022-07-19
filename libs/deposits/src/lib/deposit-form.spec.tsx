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
const MOCK_ETH_ADDRESS = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';

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
      max: new BigNumber(20),
    },
    allowance: new BigNumber(30),
    isFaucetable: true,
  };

  (useVegaWallet as jest.Mock).mockReturnValue({ keypair: null });
  (useWeb3React as jest.Mock).mockReturnValue({ account: MOCK_ETH_ADDRESS });
});

describe('Deposit form', () => {
  it('renders with default values', async () => {
    render(<DepositForm {...props} />);

    // Assert default values (including) from/to provided by useVegaWallet and useWeb3React
    expect(screen.getByLabelText('From (Ethereum address)')).toHaveValue(MOCK_ETH_ADDRESS);
    expect(screen.getByLabelText('Asset')).toHaveValue('');
    expect(screen.getByLabelText('To (Vega key)')).toHaveValue('');
    expect(screen.getByLabelText('Amount')).toHaveValue(null);
  });

  describe('fields validation', () => {
    it('fails when submitted with empty required fields', async () => {
      render(<DepositForm {...props} />);

      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(props.submitDeposit).not.toHaveBeenCalled();
      const validationMessages = await screen.findAllByRole('alert');
      expect(validationMessages).toHaveLength(3);
      validationMessages.forEach((el) => {
        expect(el).toHaveTextContent('Required');
      });
    });

    it('fails when submitted with invalid ethereum address', async () => {
      (useWeb3React as jest.Mock).mockReturnValue({ account: '123' });
      render(<DepositForm {...props} />);

      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText('Invalid Ethereum address')
      ).toBeInTheDocument();
    });

    it('fails when submitted with invalid vega wallet key', async () => {
      render(<DepositForm {...props} />);

      const invalidVegaKey = 'abc';
      fireEvent.change(screen.getByLabelText('To (Vega key)'), {
        target: { value: invalidVegaKey },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(await screen.findByText('Invalid Vega key')).toBeInTheDocument();
    });

    it('fails when submitted amount is more than the amount available in the ethereum wallet', async () => {
      render(<DepositForm {...props} />);

      // Max amount validation
      const amountMoreThanAvailable = '11';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountMoreThanAvailable },
      });

      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText('Insufficient amount in Ethereum wallet')
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is more than the maximum limit', async () => {
      render(<DepositForm {...props} />);

      const amountMoreThanLimit = '21';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountMoreThanLimit },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText('Amount is above permitted maximum')
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is more than the approved amount', async () => {
      render(<DepositForm {...props} limits={{ max: new BigNumber(100) }} />);

      const amountMoreThanAllowance = '31';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountMoreThanAllowance },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText('Amount is above approved amount')
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is less than the minimum limit', async () => {
      // Min amount validation
      render(<DepositForm {...props} selectedAsset={asset} />); // Render with selected asset so we have asset.decimals

      const amountLessThanMinViable = '0.00001';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountLessThanMinViable },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(await screen.findByText('Value is below minimum')).toBeInTheDocument();
    });

    it('fails when submitted amount is less than zero', async () => {
      render(<DepositForm {...props} />);

      const amountLessThanZero = '-0.00001';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountLessThanZero },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(await screen.findByText('Value is below minimum')).toBeInTheDocument();
    });
  });

  it('handles deposit approvals', () => {
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

  it('handles submitting a deposit', async () => {
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

    // Check deposit limit is displayed
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
      vegaPublicKey: vegaKey,
    });
  });
});
