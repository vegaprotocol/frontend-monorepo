import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { AddressField, TransferFee, TransferForm } from './transfer-form';
import { vega as vegaProtos } from '@vegaprotocol/protos';
import { formatNumber, removeDecimal } from '@vegaprotocol/utils';

describe('TransferForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const submit = () => fireEvent.submit(screen.getByTestId('transfer-form'));
  const amount = '100';
  const pubKey =
    '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';
  const asset = {
    id: 'asset-0',
    symbol: 'ASSET 0',
    name: 'Asset 0',
    decimals: 2,
    balance: '1000',
  };
  const props = {
    pubKey,
    pubKeys: [
      pubKey,
      'a4b6e3de5d7ef4e31ae1b090be49d1a2ef7bcefff60cccf7658a0d4922651cce',
    ],
    assets: [asset],
    feeFactor: '0.001',
    submitTransfer: jest.fn(),
  };

  it('validates a manually entered address', async () => {
    render(<TransferForm {...props} />);
    submit();
    expect(await screen.findAllByText('Required')).toHaveLength(3);
    const toggle = screen.getByText('Enter manually');
    fireEvent.click(toggle);
    // has switched to input
    expect(toggle).toHaveTextContent('Select from wallet');
    expect(screen.getByLabelText('Vega key')).toHaveAttribute('type', 'text');
    fireEvent.change(screen.getByLabelText('Vega key'), {
      target: { value: 'invalid-address' },
    });
    await waitFor(() => {
      const errors = screen.getAllByTestId('input-error-text');
      expect(errors[0]).toHaveTextContent('Invalid Vega key');
    });

    // same pubkey
    fireEvent.change(screen.getByLabelText('Vega key'), {
      target: { value: pubKey },
    });

    await waitFor(() => {
      const errors = screen.getAllByTestId('input-error-text');
      expect(errors[0]).toHaveTextContent('Vega key is the same');
    });
  });

  it('validates fields and submits', async () => {
    render(<TransferForm {...props} />);

    // check current pubkey not shown
    const keySelect: HTMLSelectElement = screen.getByLabelText('Vega key');
    expect(keySelect.children).toHaveLength(2);
    expect(Array.from(keySelect.options).map((o) => o.value)).toEqual([
      '',
      props.pubKeys[1],
    ]);

    submit();
    expect(await screen.findAllByText('Required')).toHaveLength(3);

    // Select a pubkey
    fireEvent.change(screen.getByLabelText('Vega key'), {
      target: { value: props.pubKeys[1] },
    });

    // Select asset
    fireEvent.change(
      // Bypass RichSelect and target hidden native select
      // eslint-disable-next-line
      document.querySelector('select[name="asset"]')!,
      { target: { value: asset.id } }
    );

    // assert rich select as updated
    expect(await screen.findByTestId('select-asset')).toHaveTextContent(
      asset.name
    );
    expect(screen.getByTestId('asset-balance')).toHaveTextContent(
      formatNumber(asset.balance, asset.decimals)
    );

    const amountInput = screen.getByLabelText('Amount');

    // Test amount validation
    fireEvent.change(amountInput, {
      target: { value: '0.00000001' },
    });
    expect(
      await screen.findByText('Value is below minimum')
    ).toBeInTheDocument();

    fireEvent.change(amountInput, {
      target: { value: '9999999' },
    });
    expect(
      await screen.findByText(/cannot transfer more/i)
    ).toBeInTheDocument();

    // set valid amount
    fireEvent.change(amountInput, {
      target: { value: amount },
    });
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(
      new BigNumber(props.feeFactor).times(amount).toFixed()
    );

    submit();

    await waitFor(() => {
      expect(props.submitTransfer).toHaveBeenCalledTimes(1);
      expect(props.submitTransfer).toHaveBeenCalledWith({
        fromAccountType: vegaProtos.AccountType.ACCOUNT_TYPE_GENERAL,
        toAccountType: vegaProtos.AccountType.ACCOUNT_TYPE_GENERAL,
        to: props.pubKeys[1],
        asset: asset.id,
        amount: removeDecimal(amount, asset.decimals),
        oneOff: {},
        kind: null,
        reference: '',
      });
    });
  });

  describe('IncludeFeesCheckbox', () => {
    it('validates fields and submits when checkbox is checked', async () => {
      render(<TransferForm {...props} />);

      // check current pubkey not shown
      const keySelect: HTMLSelectElement = screen.getByLabelText('Vega key');
      expect(keySelect.children).toHaveLength(2);
      expect(Array.from(keySelect.options).map((o) => o.value)).toEqual([
        '',
        props.pubKeys[1],
      ]);

      submit();
      expect(await screen.findAllByText('Required')).toHaveLength(3);

      // Select a pubkey
      fireEvent.change(screen.getByLabelText('Vega key'), {
        target: { value: props.pubKeys[1] },
      });

      // Select asset
      fireEvent.change(
        // Bypass RichSelect and target hidden native select
        // eslint-disable-next-line
        document.querySelector('select[name="asset"]')!,
        { target: { value: asset.id } }
      );

      // assert rich select as updated
      expect(await screen.findByTestId('select-asset')).toHaveTextContent(
        asset.name
      );
      expect(screen.getByTestId('asset-balance')).toHaveTextContent(
        formatNumber(asset.balance, asset.decimals)
      );

      const amountInput = screen.getByLabelText('Amount');
      const checkbox = screen.getByTestId('include-transfer-fee');
      expect(checkbox).not.toBeChecked();
      act(() => {
        /* fire events that update state */
        // set valid amount
        fireEvent.change(amountInput, {
          target: { value: amount },
        });
        // check include fees checkbox
        fireEvent.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      const expectedFee = new BigNumber(amount)
        .times(props.feeFactor)
        .toFixed();
      const expectedAmount = new BigNumber(amount).minus(expectedFee).toFixed();
      expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expectedFee);
      expect(screen.getByTestId('transfer-amount')).toHaveTextContent(
        expectedAmount
      );
      expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(
        amount
      );

      submit();

      await waitFor(() => {
        expect(props.submitTransfer).toHaveBeenCalledTimes(1);
        expect(props.submitTransfer).toHaveBeenCalledWith({
          fromAccountType: vegaProtos.AccountType.ACCOUNT_TYPE_GENERAL,
          toAccountType: vegaProtos.AccountType.ACCOUNT_TYPE_GENERAL,
          to: props.pubKeys[1],
          asset: asset.id,
          amount: removeDecimal(expectedAmount, asset.decimals),
          oneOff: {},
          kind: null,
          reference: '',
        });
      });
    });

    it('validates fields when checkbox is not checked', async () => {
      render(<TransferForm {...props} />);

      // check current pubkey not shown
      const keySelect: HTMLSelectElement = screen.getByLabelText('Vega key');
      expect(keySelect.children).toHaveLength(2);
      expect(Array.from(keySelect.options).map((o) => o.value)).toEqual([
        '',
        props.pubKeys[1],
      ]);

      submit();
      expect(await screen.findAllByText('Required')).toHaveLength(3);

      // Select a pubkey
      fireEvent.change(screen.getByLabelText('Vega key'), {
        target: { value: props.pubKeys[1] },
      });

      // Select asset
      fireEvent.change(
        // Bypass RichSelect and target hidden native select
        // eslint-disable-next-line
        document.querySelector('select[name="asset"]')!,
        { target: { value: asset.id } }
      );

      // assert rich select as updated
      expect(await screen.findByTestId('select-asset')).toHaveTextContent(
        asset.name
      );
      expect(screen.getByTestId('asset-balance')).toHaveTextContent(
        formatNumber(asset.balance, asset.decimals)
      );

      const amountInput = screen.getByLabelText('Amount');
      const checkbox = screen.getByTestId('include-transfer-fee');
      expect(checkbox).not.toBeChecked();
      act(() => {
        /* fire events that update state */
        // set valid amount
        fireEvent.change(amountInput, {
          target: { value: amount },
        });
      });
      expect(checkbox).not.toBeChecked();
      const expectedFee = new BigNumber(amount)
        .times(props.feeFactor)
        .toFixed();
      const total = new BigNumber(amount).plus(expectedFee).toFixed();
      expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expectedFee);
      expect(screen.getByTestId('transfer-amount')).toHaveTextContent(amount);
      expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(total);
    });
  });

  describe('AddressField', () => {
    const props = {
      pubKeys: ['pubkey-1', 'pubkey-2'],
      select: <div>select</div>,
      input: <div>input</div>,
      onChange: jest.fn(),
    };

    it('toggles content and calls onChange', async () => {
      const mockOnChange = jest.fn();
      render(<AddressField {...props} onChange={mockOnChange} />);

      // select should be shown as multiple pubkeys provided
      expect(screen.getByText('select')).toBeInTheDocument();
      expect(screen.queryByText('input')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Enter manually'));
      expect(screen.queryByText('select')).not.toBeInTheDocument();
      expect(screen.getByText('input')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByText('Select from wallet'));
      expect(screen.getByText('select')).toBeInTheDocument();
      expect(screen.queryByText('input')).not.toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('Does not provide select option if there is only a single key', () => {
      render(<AddressField {...props} pubKeys={['single-pubKey']} />);
      expect(screen.getByText('input')).toBeInTheDocument();
      expect(screen.queryByText('Select from wallet')).not.toBeInTheDocument();
    });
  });

  describe('TransferFee', () => {
    const props = {
      amount: '200',
      feeFactor: '0.001',
      fee: '0.2',
      transferAmount: '200',
      decimals: 8,
    };
    it('calculates and renders the transfer fee', () => {
      render(<TransferFee {...props} />);

      const expected = new BigNumber(props.amount)
        .times(props.feeFactor)
        .toFixed();
      const total = new BigNumber(props.amount).plus(expected).toFixed();
      expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expected);
      expect(screen.getByTestId('transfer-amount')).toHaveTextContent(
        props.amount
      );
      expect(screen.getByTestId('total-transfer-fee')).toHaveTextContent(total);
    });
  });
});
