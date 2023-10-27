import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateAccount, generateAsset } from './test-helpers';
import type { WithdrawManagerProps } from './withdraw-manager';
import { WithdrawManager } from './withdraw-manager';
import BigNumber from 'bignumber.js';

const asset = generateAsset();
const ethereumAddress = '0x72c22822A19D20DE7e426fB84aa047399Ddd8853';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ account: ethereumAddress }),
}));

const withdrawAsset = {
  asset,
  balance: new BigNumber(1),
  min: new BigNumber(0.0000001),
  threshold: new BigNumber(1000),
  delay: 10,
  handleSelectAsset: jest.fn(),
};

jest.mock('./use-withdraw-asset', () => ({
  useWithdrawAsset: () => withdrawAsset,
}));

jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useAccountBalance: jest.fn(() => ({ accountBalance: 0, accountDecimals: 0 })),
}));

jest.mock('@vegaprotocol/web3', () => ({
  ...jest.requireActual('@vegaprotocol/web3'),
  useGetWithdrawThreshold: () => {
    return () => Promise.resolve(new BigNumber(100));
  },
  useGetWithdrawDelay: () => {
    return () => Promise.resolve(10000);
  },
}));

describe('WithdrawManager', () => {
  let props: WithdrawManagerProps;

  beforeEach(() => {
    props = {
      assets: [asset],
      accounts: [generateAccount()],
      submit: jest.fn(),
      assetId: asset.id,
    };
  });

  const generateJsx = (props: WithdrawManagerProps) => (
    <WithdrawManager {...props} />
  );

  it('calls submit if valid form submission', async () => {
    // 1002-WITH-002
    // 1002-WITH-003
    const { container } = render(generateJsx(props));
    const select = container.querySelector('select[name="asset"]') as Element;
    await userEvent.selectOptions(select, props.assets[0].id);
    await userEvent.clear(screen.getByLabelText('To (Ethereum address)'));
    await userEvent.type(
      screen.getByLabelText('To (Ethereum address)'),
      ethereumAddress
    );
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
    const { container } = render(generateJsx(props));

    // Set other fields to be valid
    const select = container.querySelector('select[name="asset"]') as Element;
    await userEvent.selectOptions(select, props.assets[0].id);
    expect(screen.getByTestId('connect-eth-wallet-btn')).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('To (Ethereum address)'),
      ethereumAddress
    );

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
    render(generateJsx(props));

    await userEvent.click(screen.getByTestId('use-maximum'));
    expect(screen.getByTestId('amount-input')).toHaveValue(1);
  });

  it('shows withdraw delay notification if amount greater than threshold', async () => {
    render(generateJsx(props));
    await userEvent.type(screen.getByLabelText('Amount'), '1001');
    expect(
      await screen.findByTestId('amount-withdrawal-delay-notification')
    ).toBeInTheDocument();
  });

  it('shows withdraw delay notification if threshold is 0', async () => {
    withdrawAsset.threshold = new BigNumber(0);
    render(generateJsx(props));
    await userEvent.type(screen.getByLabelText('Amount'), '0.01');
    expect(
      await screen.findByTestId('withdrawals-delay-notification')
    ).toBeInTheDocument();
  });
});
