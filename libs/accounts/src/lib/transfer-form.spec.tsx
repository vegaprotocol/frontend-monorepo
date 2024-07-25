import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BigNumber from 'bignumber.js';
import {
  AddressField,
  TransferFee,
  TransferForm,
  type TransferFormProps,
} from './transfer-form';
import {
  AccountType,
  AccountTypeMapping,
  AssetStatus,
} from '@vegaprotocol/types';
import { removeDecimal } from '@vegaprotocol/utils';
import type { TransferFeeQuery } from './__generated__/TransferFee';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react/testing';

const feeFactor = 0.001;

const mockUseTransferFeeQuery = jest.fn(
  ({
    variables: { amount },
  }: {
    variables: { amount: string };
  }): { data: TransferFeeQuery } => {
    return {
      data: {
        estimateTransferFee: {
          discount: '0',
          fee: (Number(amount) * feeFactor).toFixed(),
        },
      },
    };
  }
);

jest.mock('./__generated__/TransferFee', () => ({
  useTransferFeeQuery: (props: { variables: { amount: string } }) =>
    mockUseTransferFeeQuery(props),
}));

describe('TransferForm', () => {
  const renderComponent = (props: TransferFormProps) => {
    return render(
      <MockedWalletProvider>
        <TransferForm {...props} />
      </MockedWalletProvider>
    );
  };

  const submit = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Transfer' }));
  };

  const selectAsset = async (asset: {
    id: string;
    name: string;
    decimals: number;
  }) => {
    // Bypass RichSelect and target hidden native select
    // eslint-disable-next-line
    fireEvent.change(document.querySelector('select[name="asset"]')!, {
      target: { value: asset.id },
    });

    // assert rich select as updated
    expect(await screen.findByTestId('select-asset')).toHaveTextContent(
      asset.name
    );
  };

  const amount = '100';
  const pubKey = '1'.repeat(64);
  const asset: AssetFieldsFragment = {
    id: 'eur',
    symbol: '€',
    name: 'EUR',
    decimals: 2,
    quantum: '1',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      chainId: '1',
      contractAddress: '0x0',
      lifetimeLimit: '',
      withdrawThreshold: '',
    },
  };
  const props = {
    pubKey,
    pubKeys: [
      { publicKey: pubKey, name: 'name-1' },
      { publicKey: '2'.repeat(64), name: 'name-2' },
    ],
    submitTransfer: jest.fn(),
    accounts: [
      {
        type: AccountType.ACCOUNT_TYPE_GENERAL,
        asset,
        balance: '100000',
      },
      {
        type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        asset,
        balance: '10000',
      },
    ],
    minQuantumMultiple: '1',
  };

  const propsNoAssets = {
    pubKey,
    pubKeys: [
      { publicKey: pubKey, name: 'name-1' },
      {
        publicKey:
          'a4b6e3de5d7ef4e31ae1b090be49d1a2ef7bcefff60cccf7658a0d4922651cce',
        name: 'name-2',
      },
    ],
    submitTransfer: jest.fn(),
    accounts: [],
    minQuantumMultiple: '1',
  };

  it('renders no assets', async () => {
    renderComponent(propsNoAssets);
    expect(screen.getByTestId('no-assets-available')).toBeVisible();
  });

  it('renders no accounts', async () => {
    renderComponent(propsNoAssets);
    expect(screen.getByTestId('no-accounts-available')).toBeVisible();
  });

  it.each([
    {
      targetText: 'Amount to be transferred',
      tooltipText: /without the fee/,
    },
    {
      targetText: 'Total amount (with fee)',
      tooltipText: /total amount taken from your account/,
    },
  ])('Tooltip for "$targetText" shows', async (o) => {
    // 1003-TRAN-018
    // 1003-TRAN-019
    renderComponent(props);
    // Select a pubkey
    await userEvent.selectOptions(
      screen.getByLabelText('To Vega key'),
      props.pubKeys[1].publicKey
    );

    // Select asset
    await selectAsset(asset);

    await userEvent.selectOptions(
      screen.getByLabelText('From account'),
      `${AccountType.ACCOUNT_TYPE_GENERAL}-${asset.id}`
    );
    // set valid amount
    const amountInput = screen.getByLabelText('Amount');
    await userEvent.type(amountInput, amount);
    expect(amountInput).toHaveValue(amount);

    const label = screen.getByText(o.targetText);
    await userEvent.hover(label);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(o.tooltipText);
  });

  it('validates a manually entered address', async () => {
    // 1003-TRAN-012
    // 1003-TRAN-013
    // 1003-TRAN-004
    renderComponent(props);
    await submit();
    expect(await screen.findAllByText('Required')).toHaveLength(2); // pubkey is set as default value
    const toggle = screen.getByText('Enter manually');
    await userEvent.click(toggle);
    // has switched to input
    expect(toggle).toHaveTextContent('Select from wallet');
    expect(screen.getByLabelText('To Vega key')).toHaveAttribute(
      'type',
      'text'
    );
    await userEvent.type(
      screen.getByLabelText('To Vega key'),
      'invalid-address'
    );
    expect(screen.getAllByTestId('input-error-text')[1]).toHaveTextContent(
      'Invalid Vega key'
    );
  });

  it('sends transfer from general accounts', async () => {
    // 1003-TRAN-002
    // 1003-TRAN-003
    // 1002-WITH-010
    // 1003-TRAN-011
    // 1003-TRAN-014
    renderComponent(props);

    // check current pubkey not shown
    const keySelect = screen.getByLabelText<HTMLSelectElement>('To Vega key');
    expect(keySelect.children).toHaveLength(3);
    expect(Array.from(keySelect.options).map((o) => o.value)).toEqual([
      '',
      pubKey,
      props.pubKeys[1].publicKey,
    ]);

    await submit();
    expect(await screen.findAllByText('Required')).toHaveLength(2); // pubkey is set as default value

    // Select a pubkey
    await userEvent.selectOptions(
      screen.getByLabelText('To Vega key'),
      props.pubKeys[1].publicKey
    );

    // Select asset
    await selectAsset(asset);

    await userEvent.selectOptions(
      screen.getByLabelText('From account'),
      `${AccountType.ACCOUNT_TYPE_GENERAL}-${asset.id}`
    );

    const amountInput = screen.getByLabelText('Amount');

    // Test use max button
    await userEvent.click(screen.getByRole('button', { name: 'Use max' }));
    expect(amountInput).toHaveValue('1000.00');

    // Test amount validation
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '0.001'); // Below quantum multiple amount
    expect(
      await screen.findByText(/Amount below minimum requirement/)
    ).toBeInTheDocument();

    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '9999999');
    expect(
      await screen.findByText(/cannot transfer more/i)
    ).toBeInTheDocument();

    // set valid amount
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, amount);
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent('1');

    await submit();

    await waitFor(() => {
      expect(props.submitTransfer).toHaveBeenCalledTimes(1);
      expect(props.submitTransfer).toHaveBeenCalledWith({
        fromAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        toAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        to: props.pubKeys[1].publicKey,
        asset: asset.id,
        amount: removeDecimal(amount, asset.decimals),
        oneOff: {},
      });
    });
  });

  it('sends transfer from vested accounts', async () => {
    const mockSubmit = jest.fn();
    renderComponent({
      ...props,
      submitTransfer: mockSubmit,
      minQuantumMultiple: '100000',
    });

    // check current pubkey not shown
    const keySelect: HTMLSelectElement = screen.getByLabelText('To Vega key');
    const pubKeyOptions = ['', pubKey, props.pubKeys[1].publicKey];
    expect(keySelect.children).toHaveLength(pubKeyOptions.length);
    expect(Array.from(keySelect.options).map((o) => o.value)).toEqual(
      pubKeyOptions
    );

    await submit();
    expect(await screen.findAllByText('Required')).toHaveLength(2); // pubkey set as default value

    // Select a pubkey
    await userEvent.selectOptions(
      screen.getByLabelText('To Vega key'),
      props.pubKeys[1].publicKey // Use not current pubkey so we can check it switches to current pubkey later
    );

    // Select asset
    await selectAsset(asset);

    await userEvent.selectOptions(
      screen.getByLabelText('From account'),
      `${AccountType.ACCOUNT_TYPE_VESTED_REWARDS}-${asset.id}`
    );

    // Check switch back to connected key
    expect(screen.getByLabelText('To Vega key')).toHaveValue(props.pubKey);

    const amountInput = screen.getByLabelText('Amount');

    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '50');

    expect(await screen.findByText(/Use max to bypass/)).toBeInTheDocument();

    // Test use max button
    await userEvent.click(screen.getByRole('button', { name: 'Use max' }));
    expect(amountInput).toHaveValue('100.00');

    // If transfering from a vested account  fees should be 0
    const expectedFee = '0';
    const total = new BigNumber(amount).plus(expectedFee).toFixed();

    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expectedFee);
    expect(screen.getByTestId('transfer-amount')).toHaveTextContent(amount);
    expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(total);

    await submit();

    await waitFor(() => {
      // 1003-TRAN-023
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({
        fromAccountType: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        toAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        to: props.pubKey,
        asset: asset.id,
        amount: removeDecimal(amount, asset.decimals),
        oneOff: {},
      });
    });
  });

  it('handles lots of decimal places', async () => {
    const balance = '904195168829277777';
    const expectedBalance = '0.904195168829277777';

    const longDecimalAsset: AssetFieldsFragment = {
      id: 'assetId',
      symbol: 'VEGA',
      name: 'VEGA',
      decimals: 18,
      quantum: '1',
      status: AssetStatus.STATUS_ENABLED,
      source: {
        __typename: 'ERC20',
        chainId: '1',
        contractAddress: '0x0',
        lifetimeLimit: '',
        withdrawThreshold: '',
      },
    };

    const account = {
      type: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
      asset: longDecimalAsset,
      balance,
    };

    const mockSubmit = jest.fn();

    renderComponent({
      ...props,
      accounts: [account],
      submitTransfer: mockSubmit,
      minQuantumMultiple: '100000',
    });

    // Select a pubkey
    await userEvent.selectOptions(
      screen.getByLabelText('To Vega key'),
      props.pubKeys[1].publicKey // Use not current pubkey so we can check it switches to current pubkey later
    );

    // Select asset
    await selectAsset(longDecimalAsset);

    const accountSelect = screen.getByLabelText('From account');
    const option = within(accountSelect)
      .getAllByRole('option')
      .find(
        (o) => o.getAttribute('value') === `${account.type}-${account.asset.id}`
      );
    // plus one for disabled 'please select' option

    expect(option).toHaveTextContent(
      `${AccountTypeMapping[account.type]} (${expectedBalance} ${
        account.asset.symbol
      })`
    );

    await userEvent.selectOptions(
      accountSelect,
      `${AccountType.ACCOUNT_TYPE_VESTED_REWARDS}-${longDecimalAsset.id}`
    );

    expect(accountSelect).toHaveValue(
      `${AccountType.ACCOUNT_TYPE_VESTED_REWARDS}-${longDecimalAsset.id}`
    );

    // Check switch back to connected key
    const amountInput = screen.getByLabelText('Amount');

    // Test use max button
    await userEvent.click(screen.getByRole('button', { name: 'Use max' }));
    expect(amountInput).toHaveValue(expectedBalance);

    await submit();

    await waitFor(() => {
      // 1003-TRAN-023
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({
        fromAccountType: AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        toAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        to: props.pubKey,
        asset: longDecimalAsset.id,
        amount: balance,
        oneOff: {},
      });
    });
  });

  it('validates fields', async () => {
    renderComponent(props);

    // check current pubkey not shown
    const keySelect: HTMLSelectElement = screen.getByLabelText('To Vega key');
    const pubKeyOptions = ['', pubKey, props.pubKeys[1].publicKey];
    expect(keySelect.children).toHaveLength(pubKeyOptions.length);
    expect(Array.from(keySelect.options).map((o) => o.value)).toEqual(
      pubKeyOptions
    );

    await submit();
    expect(await screen.findAllByText('Required')).toHaveLength(2); // pubkey set as default value

    // Select a pubkey
    await userEvent.selectOptions(
      screen.getByLabelText('To Vega key'),
      props.pubKeys[1].publicKey
    );

    // Select asset
    await selectAsset(asset);

    await userEvent.selectOptions(
      screen.getByLabelText('From account'),
      `${AccountType.ACCOUNT_TYPE_GENERAL}-${asset.id}`
    );

    const amountInput = screen.getByLabelText('Amount');

    await userEvent.type(amountInput, amount);
    const expectedFee = new BigNumber(amount).times(feeFactor).toFixed();
    const total = new BigNumber(amount).plus(expectedFee).toFixed();
    // 1003-TRAN-021
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expectedFee);
    expect(screen.getByTestId('transfer-amount')).toHaveTextContent(amount);
    expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(total);
  });

  describe('AddressField', () => {
    const props = {
      mode: 'select' as const,
      select: <div>select</div>,
      input: <div>input</div>,
      onChange: jest.fn(),
    };

    it('renders correct content by mode prop and calls onChange', async () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(
        <AddressField {...props} onChange={mockOnChange} />
      );

      // select should be shown by default
      expect(screen.getByText('select')).toBeInTheDocument();
      expect(screen.queryByText('input')).not.toBeInTheDocument();
      await userEvent.click(screen.getByText('Enter manually'));
      expect(mockOnChange).toHaveBeenCalled();

      rerender(<AddressField {...props} mode="input" />);

      expect(screen.queryByText('select')).not.toBeInTheDocument();
      expect(screen.getByText('input')).toBeInTheDocument();
    });
  });

  describe('TransferFee', () => {
    const props = {
      amount: '20000',
      discount: '0',
      fee: '20',
      decimals: 2,
    };
    it('calculates and renders amounts and fee', () => {
      render(<TransferFee {...props} />);
      expect(screen.queryByTestId('discount')).not.toBeInTheDocument();
      expect(screen.getByTestId('transfer-fee')).toHaveTextContent('0.2');
      expect(screen.getByTestId('transfer-amount')).toHaveTextContent('200.00');
      expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(
        '200.20'
      );
    });

    it('calculates and renders amounts, fee and discount', () => {
      render(<TransferFee {...props} discount="10" />);
      expect(screen.getByTestId('discount')).toHaveTextContent('0.1');
      expect(screen.getByTestId('transfer-fee')).toHaveTextContent('0.2');
      expect(screen.getByTestId('transfer-amount')).toHaveTextContent('200.00');
      expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(
        '200.10'
      );
    });
  });
});
