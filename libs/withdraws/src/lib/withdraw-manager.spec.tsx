import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateAccount, generateAsset } from './test-helpers';
import type { WithdrawManagerProps } from './withdraw-manager';
import { WithdrawManager } from './withdraw-manager';
import BigNumber from 'bignumber.js';
import { toAssetData, useGetWithdrawThreshold } from '@vegaprotocol/web3';
import { useWithdrawAsset } from './use-withdraw-asset';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

const asset = generateAsset();
const ethereumAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    account: '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
    chainId: 1,
  }),
}));

jest.mock('./use-withdraw-asset', () => ({
  useWithdrawAsset: jest.fn(),
}));

jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useAccountBalance: jest.fn(() => ({ accountBalance: 0, accountDecimals: 0 })),
}));

jest.mock('@vegaprotocol/web3', () => ({
  ...jest.requireActual('@vegaprotocol/web3'),
  useGetWithdrawDelay: () => {
    return () => Promise.resolve(10000);
  },
  useGetWithdrawThreshold: jest.fn(),
  useGasPrice: () => undefined,
}));

describe('WithdrawManager', () => {
  let props: WithdrawManagerProps;

  beforeEach(() => {
    (useWithdrawAsset as jest.Mock).mockReturnValue({
      asset: toAssetData(asset),
      balance: new BigNumber(1),
      min: new BigNumber(0.0000001),
      threshold: new BigNumber(1000),
      delay: 10,
      handleSelectAsset: jest.fn(),
    });

    (useGetWithdrawThreshold as jest.Mock).mockReturnValue(
      Promise.resolve(new BigNumber(100))
    );

    props = {
      assets: [asset],
      accounts: [generateAccount()],
      submit: jest.fn(),
      assetId: asset.id,
    };
  });

  const renderComponent = (props: WithdrawManagerProps) => {
    return render(
      <TooltipProvider>
        <WithdrawManager {...props} />
      </TooltipProvider>
    );
  };

  it('calls submit if valid form submission', async () => {
    // 1002-WITH-002
    // 1002-WITH-003
    const { container } = renderComponent(props);
    const select = container.querySelector('select[name="asset"]') as Element;
    await userEvent.selectOptions(select, props.assets[0].id);
    await userEvent.type(screen.getByLabelText('Amount'), '0.01');
    await userEvent.click(screen.getByTestId('submit-withdrawal'));
    expect(props.submit).toHaveBeenCalledWith({
      amount: '1000',
      asset: props.assets[0].id,
      receiverAddress: ethereumAddress,
      availableTimestamp: null,
    });
  });

  it('validates correctly', async () => {
    // 1002-WITH-010
    // 1002-WITH-005
    // 1002-WITH-008
    // 1002-WITH-018
    const { container } = renderComponent(props);

    // Set other fields to be valid
    const select = container.querySelector('select[name="asset"]') as Element;
    await userEvent.selectOptions(select, props.assets[0].id);
    expect(screen.getByTestId('connect-eth-wallet-btn')).toBeInTheDocument();

    // Min amount
    await userEvent.clear(screen.getByLabelText('Amount'));
    await userEvent.type(screen.getByLabelText('Amount'), '0.00000001');
    await userEvent.click(screen.getByTestId('submit-withdrawal'));

    expect(
      await screen.findByText('Value is below minimum')
    ).toBeInTheDocument();
    expect(props.submit).not.toBeCalled();

    await userEvent.clear(screen.getByLabelText('Amount'));
    await userEvent.type(screen.getByLabelText('Amount'), '0.00001');

    // Max amount (balance is 1)
    await userEvent.clear(screen.getByLabelText('Amount'));
    await userEvent.type(screen.getByLabelText('Amount'), '2');

    await userEvent.click(screen.getByTestId('submit-withdrawal'));
    expect(
      await screen.findByText('Insufficient amount in account')
    ).toBeInTheDocument();
    expect(props.submit).not.toBeCalled();
  });
  it('can set amount using use maximum button', async () => {
    // 1002-WITH-004
    renderComponent(props);

    await userEvent.click(screen.getByTestId('use-maximum'));
    expect(screen.getByTestId('amount-input')).toHaveValue(1);
  });

  it('shows withdraw delay notification if amount greater than threshold', async () => {
    renderComponent(props);
    await userEvent.type(screen.getByLabelText('Amount'), '1001');
    expect(
      await screen.findByTestId('amount-withdrawal-delay-notification')
    ).toBeInTheDocument();
  });

  it('shows withdraw delay notification if threshold is 0', async () => {
    (useGetWithdrawThreshold as jest.Mock).mockReturnValue(
      Promise.resolve(new BigNumber(0))
    );
    (useWithdrawAsset as jest.Mock).mockReturnValue({
      asset: toAssetData(asset),
      balance: new BigNumber(1),
      min: new BigNumber(0.0000001),
      threshold: new BigNumber(0),
      delay: 10,
      handleSelectAsset: jest.fn(),
    });

    renderComponent(props);
    await userEvent.type(screen.getByLabelText('Amount'), '0.01');
    expect(
      await screen.findByTestId('withdrawals-delay-notification')
    ).toBeInTheDocument();
  });
});
