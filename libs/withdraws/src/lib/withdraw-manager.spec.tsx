import { act, fireEvent, render, screen } from '@testing-library/react';
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

const mockWithdrawAsset = {
  asset,
  balance: new BigNumber(1),
  min: new BigNumber(0.0000001),
  threshold: new BigNumber(1000),
  delay: 10,
  handleSelectAsset: jest.fn(),
};
const mockUseWithdrawAsset = jest.fn(() => mockWithdrawAsset);
jest.mock('./use-withdraw-asset', () => ({
  useWithdrawAsset: () => mockWithdrawAsset,
}));

jest.mock('@vegaprotocol/accounts', () => ({
  ...jest.requireActual('@vegaprotocol/accounts'),
  useAccountBalance: jest.fn(() => ({ accountBalance: 0, accountDecimals: 0 })),
}));

const mockWithdrawThreshold = new BigNumber(100);
jest.mock('@vegaprotocol/web3', () => ({
  ...jest.requireActual('@vegaprotocol/web3'),
  useGetWithdrawThreshold: () => {
    return () => Promise.resolve(mockWithdrawThreshold);
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
    const { container } = render(generateJsx(props));
    await act(async () => {
      await submitValid(container);
    });
    expect(props.submit).toHaveBeenCalledWith({
      amount: '1000',
      asset: props.assets[0].id,
      receiverAddress: ethereumAddress,
      availableTimestamp: null,
    });
  });

  it('validates correctly', async () => {
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
    expect(
      await screen.findByText('Value is below minimum')
    ).toBeInTheDocument();
    expect(props.submit).not.toBeCalled();

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
    expect(props.submit).not.toBeCalled();
  });

  const submitValid = async (container: HTMLElement) => {
    const select = container.querySelector('select[name="asset"]') as Element;
    await userEvent.selectOptions(select, props.assets[0].id);
    fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
      target: { value: ethereumAddress },
    });
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '0.01' },
    });
    fireEvent.submit(screen.getByTestId('withdraw-form'));
  };

  it('shows withdraw delay notification if amount greater than threshold', async () => {
    render(generateJsx(props));
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '1001' },
    });
    expect(
      await screen.findByTestId('amount-withdrawal-delay-notification')
    ).toBeInTheDocument();
  });

  it('shows withdraw delay notification if threshold is 0', async () => {
    mockWithdrawAsset.threshold = new BigNumber(0);
    render(generateJsx(props));
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '0.01' },
    });
    expect(
      await screen.findByTestId('withdrawals-delay-notification')
    ).toBeInTheDocument();
  });
});
