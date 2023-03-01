import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { AddressField, TransferFee, TransferForm } from './transfer-form';
import { AccountType } from '@vegaprotocol/types';
import { formatNumber, removeDecimal } from '@vegaprotocol/utils';

describe('TransferForm', () => {
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

    // Test amount validation
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '0.00000001' },
    });
    expect(
      await screen.findByText('Value is below minimum')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '9999999' },
    });
    expect(
      await screen.findByText(/cannot transfer more/i)
    ).toBeInTheDocument();

    // set valid amount
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: amount },
    });
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(
      new BigNumber(props.feeFactor).times(amount).toFixed()
    );

    submit();

    await waitFor(() => {
      expect(props.submitTransfer).toHaveBeenCalledTimes(1);
      expect(props.submitTransfer).toHaveBeenCalledWith({
        fromAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        toAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        to: props.pubKeys[1],
        asset: asset.id,
        amount: removeDecimal(amount, asset.decimals),
        oneOff: {},
      });
    });
  });

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
  };
  it('calculates and renders the transfer fee', () => {
    render(<TransferFee {...props} />);

    const expected = new BigNumber(props.amount)
      .times(props.feeFactor)
      .toFixed();
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expected);
  });
});
