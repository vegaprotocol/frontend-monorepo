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

jest.mock('./use-withdraw-asset', () => ({
  useWithdrawAsset: () => ({
    asset,
    balance: new BigNumber(1),
    min: new BigNumber(0.0000001),
    threshold: new BigNumber(1000),
    delay: 10,
    handleSelectAsset: jest.fn(),
  }),
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
    render(generateJsx(props));
    await act(async () => {
      await submitValid();
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

  const submitValid = async () => {
    await userEvent.selectOptions(
      screen.getByLabelText('Asset'),
      props.assets[0].id
    );
    fireEvent.change(screen.getByLabelText('To (Ethereum address)'), {
      target: { value: ethereumAddress },
    });
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '0.01' },
    });
    fireEvent.submit(screen.getByTestId('withdraw-form'));
  };
});
