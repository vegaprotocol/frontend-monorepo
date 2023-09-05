import {
  waitFor,
  fireEvent,
  render,
  screen,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BigNumber from 'bignumber.js';
import type { DepositFormProps } from './deposit-form';
import { DepositForm } from './deposit-form';
import * as Schema from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import type { DepositBalances } from './use-deposit-balances';

jest.mock('@vegaprotocol/wallet');
jest.mock('@vegaprotocol/web3');
jest.mock('@web3-react/core');

const mockConnector = { deactivate: jest.fn() };

function generateAsset(): AssetFieldsFragment {
  return {
    __typename: 'Asset',
    id: 'asset-id',
    symbol: 'asset-symbol',
    name: 'asset-name',
    decimals: 2,
    quantum: '',
    status: Schema.AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: 'contract-address',
      lifetimeLimit: '',
      withdrawThreshold: '',
    },
    infrastructureFeeAccount: {
      balance: '1',
      __typename: 'AccountBalance',
    },
  };
}

let asset: AssetFieldsFragment;
let props: DepositFormProps;
let balances: DepositBalances;
const MOCK_ETH_ADDRESS = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
const MOCK_VEGA_KEY =
  '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';

beforeEach(() => {
  asset = generateAsset();
  balances = {
    balance: new BigNumber(5),
    max: new BigNumber(20),
    allowance: new BigNumber(30),
    deposited: new BigNumber(10),
    exempt: false,
  };
  props = {
    assets: [asset],
    selectedAsset: undefined,
    onSelectAsset: jest.fn(),
    balances,
    submitApprove: jest.fn(),
    submitDeposit: jest.fn(),
    submitFaucet: jest.fn(),
    onDisconnect: jest.fn(),
    handleAmountChange: jest.fn(),
    approveTxId: null,
    faucetTxId: null,
    isFaucetable: true,
  };

  (useVegaWallet as jest.Mock).mockReturnValue({ pubKey: null, pubKeys: [] });
  (useWeb3React as jest.Mock).mockReturnValue({
    isActive: true,
    account: MOCK_ETH_ADDRESS,
    connector: mockConnector,
  });
});

describe('Deposit form', () => {
  it('renders with default values', async () => {
    render(<DepositForm {...props} />);

    // Assert default values (including) from/to provided by useVegaWallet and useWeb3React
    expect(screen.getByText('From (Ethereum address)')).toBeInTheDocument();
    expect(screen.getByTestId('ethereum-address')).toHaveTextContent(
      MOCK_ETH_ADDRESS
    );
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

    it('fails when Ethereum wallet not connected', async () => {
      (useWeb3React as jest.Mock).mockReturnValue({
        isActive: false,
        account: '',
      });
      render(<DepositForm {...props} />);

      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText('Connect Ethereum wallet')
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
      const amountMoreThanAvailable = '7';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountMoreThanAvailable },
      });

      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText(
          "You can't deposit more than you have in your Ethereum wallet, 5"
        )
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is more than the maximum limit', async () => {
      render(<DepositForm {...props} selectedAsset={asset} />);

      const amountMoreThanLimit = '21';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountMoreThanLimit },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText(
          "You can't deposit more than your remaining deposit allowance, 10 asset-symbol"
        )
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is more than the approved amount', async () => {
      render(
        <DepositForm
          {...props}
          balances={{
            ...balances,
            balance: BigNumber(100),
            max: new BigNumber(100),
            deposited: new BigNumber(10),
          }}
        />
      );

      const amountMoreThanAllowance = '31';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountMoreThanAllowance },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText(
          "You can't deposit more than your approved deposit amount, 30"
        )
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

      expect(
        await screen.findByText('Value is below minimum')
      ).toBeInTheDocument();
    });

    it('fails when submitted amount is less than zero', async () => {
      render(<DepositForm {...props} />);

      const amountLessThanZero = '-0.00001';
      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: amountLessThanZero },
      });
      fireEvent.submit(screen.getByTestId('deposit-form'));

      expect(
        await screen.findByText('Value is below minimum')
      ).toBeInTheDocument();
    });
  });

  it('handles deposit approvals', async () => {
    const mockUseVegaWallet = useVegaWallet as jest.Mock;
    mockUseVegaWallet.mockReturnValue({ pubKey: MOCK_VEGA_KEY });

    const mockUseWeb3React = useWeb3React as jest.Mock;
    mockUseWeb3React.mockReturnValue({
      account: MOCK_ETH_ADDRESS,
      isActive: true,
      connector: mockConnector,
    });

    render(
      <DepositForm
        {...props}
        balances={{
          ...balances,
          allowance: new BigNumber(0),
        }}
        selectedAsset={asset}
      />
    );

    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
    expect(screen.getByTestId('approve-default')).toHaveTextContent(
      `Before you can make a deposit of your chosen asset, ${asset.symbol}, you need to approve its use in your Ethereum wallet`
    );

    fireEvent.click(
      screen.getByRole('button', { name: `Approve ${asset.symbol}` })
    );

    await waitFor(() => {
      expect(props.submitApprove).toHaveBeenCalled();
    });
  });

  it('handles submitting a deposit', async () => {
    const pubKey =
      'f8885edfa7ffdb6ed996ca912e9258998e47bf3515c885cf3c63fb56b15de36f';
    const mockUseVegaWallet = useVegaWallet as jest.Mock;
    mockUseVegaWallet.mockReturnValue({ pubKey });

    const account = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';
    const mockUseWeb3React = useWeb3React as jest.Mock;
    mockUseWeb3React.mockReturnValue({
      account,
      isActive: true,
      connector: mockConnector,
    });

    const balance = new BigNumber(50);
    const max = new BigNumber(20);
    const deposited = new BigNumber(10);
    render(
      <DepositForm
        {...props}
        balances={{
          allowance: new BigNumber(100),
          balance,
          max,
          deposited,
          exempt: false,
        }}
        selectedAsset={asset}
      />
    );

    // Check deposit limit is displayed
    expect(screen.getByTestId('BALANCE_AVAILABLE_value')).toHaveTextContent(
      '50'
    );
    expect(screen.getByTestId('REMAINING_value')).toHaveTextContent('10');

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '8' },
    });

    fireEvent.click(
      screen.getByText('Deposit', { selector: '[type="submit"]' })
    );

    await waitFor(() => {
      expect(props.submitDeposit).toHaveBeenCalledWith({
        // @ts-ignore contract address definitely defined
        assetSource: asset.source.contractAddress,
        amount: '8',
        vegaPublicKey: pubKey,
      });
    });
  });

  it('shows "View asset details" button when an asset is selected', async () => {
    render(<DepositForm {...props} selectedAsset={asset} />);
    expect(await screen.getByTestId('view-asset-details')).toBeInTheDocument();
  });

  it('does not shows "View asset details" button when no asset is selected', async () => {
    render(<DepositForm {...props} />);
    expect(await screen.queryAllByTestId('view-asset-details')).toHaveLength(0);
  });

  it('renders a connect button if Ethereum wallet is not connected', () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      isActive: false,
      account: '',
    });
    render(<DepositForm {...props} />);

    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    expect(
      screen.queryByLabelText('From (Ethereum address)')
    ).not.toBeInTheDocument();
  });

  it('renders a disabled input if Ethereum wallet is connected', () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      isActive: true,
      account: MOCK_ETH_ADDRESS,
    });
    render(<DepositForm {...props} />);

    expect(
      screen.queryByRole('button', { name: 'Connect' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('From (Ethereum address)')).toBeInTheDocument();
    expect(screen.getByTestId('ethereum-address')).toHaveTextContent(
      MOCK_ETH_ADDRESS
    );
  });

  it('prevents submission if you are on the wrong chain', () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      isActive: true,
      account: MOCK_ETH_ADDRESS,
      chainId: 1,
    });
    (useWeb3ConnectStore as unknown as jest.Mock).mockImplementation(
      // eslint-disable-next-line
      (selector: (result: ReturnType<typeof useWeb3ConnectStore>) => any) => {
        return selector({
          desiredChainId: 11155111,
          open: jest.fn(),
          foo: 'asdf',
        });
      }
    );
    render(<DepositForm {...props} />);
    expect(screen.getByTestId('chain-error')).toHaveTextContent(
      /this app only works on/i
    );
  });

  it('Remaining deposit allowance tooltip should be rendered', async () => {
    render(<DepositForm {...props} selectedAsset={asset} />);
    await act(async () => {
      await userEvent.hover(screen.getByText('Remaining deposit allowance'));
    });
    await waitFor(async () => {
      await expect(
        screen.getByRole('tooltip', {
          name: /VEGA has a lifetime deposit limit of 20 asset-symbol per address/,
        })
      ).toBeInTheDocument();
    });
  });

  it('Ethereum deposit cap tooltip should be rendered', async () => {
    render(<DepositForm {...props} selectedAsset={asset} />);
    await act(async () => {
      await userEvent.hover(screen.getByText('Ethereum deposit cap'));
    });
    await waitFor(async () => {
      await expect(
        screen.getByRole('tooltip', {
          name: /The deposit cap is set when you approve an asset for use with this app/,
        })
      ).toBeInTheDocument();
    });
  });
});
