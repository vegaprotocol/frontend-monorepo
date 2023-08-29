import { render, screen } from '@testing-library/react';
import { WalletError } from '../connectors';
import { VegaTxStatus } from '../use-vega-transaction';
import type { VegaTransactionDialogProps } from './vega-transaction-dialog';
import { VegaTransactionDialog } from './vega-transaction-dialog';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_EXPLORER_URL: 'https://test.explorer.vega.network',
    VEGA_ENV: 'TESTNET',
  }),
  Networks: {
    MAINNET: 'MAINNET',
    TESTNET: 'TESTNET',
  },
}));

describe('VegaTransactionDialog', () => {
  let props: VegaTransactionDialogProps;

  beforeEach(() => {
    props = {
      isOpen: true,
      onChange: () => false,
      transaction: {
        dialogOpen: true,
        status: VegaTxStatus.Requested,
        error: null,
        txHash: null,
        signature: null,
      },
    };
  });

  it('requested', () => {
    render(<VegaTransactionDialog {...props} />);
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/confirm/i);
    expect(screen.getByTestId(VegaTxStatus.Requested)).toHaveTextContent(
      /please open your wallet/i
    );
    expect(screen.getByTestId('testnet-transaction-info')).toHaveTextContent(
      /^\[This is TESTNET transaction only\]$/
    );
  });

  it('pending', () => {
    render(
      <VegaTransactionDialog
        {...props}
        transaction={{
          ...props.transaction,
          txHash: 'tx-hash',
          status: VegaTxStatus.Pending,
        }}
      />
    );
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/awaiting/i);
    expect(screen.getByTestId(VegaTxStatus.Pending)).toHaveTextContent(
      /please wait/i
    );
    testBlockExplorerLink('tx-hash');
  });

  it('error', () => {
    render(
      <VegaTransactionDialog
        {...props}
        transaction={{
          ...props.transaction,
          error: new WalletError('rejected', 1),
          status: VegaTxStatus.Error,
        }}
      />
    );
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/failed/i);
    expect(screen.getByTestId(VegaTxStatus.Error)).toHaveTextContent(
      /rejected/i
    );
  });

  it('default complete', () => {
    render(
      <VegaTransactionDialog
        {...props}
        transaction={{
          ...props.transaction,
          txHash: 'tx-hash',
          status: VegaTxStatus.Complete,
        }}
      />
    );
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/complete/i);
    expect(screen.getByTestId(VegaTxStatus.Complete)).toHaveTextContent(
      /confirmed/i
    );
    testBlockExplorerLink('tx-hash');
  });

  it.each(Object.keys(VegaTxStatus))(
    'renders custom content for %s',
    (status) => {
      const title = `${status} title`;
      const text = `${status} content`;
      const content = {
        [status]: <div>{text}</div>,
      };
      render(
        <VegaTransactionDialog
          {...props}
          transaction={{
            ...props.transaction,
            txHash: 'tx-hash',
            status: status as VegaTxStatus,
          }}
          title={title}
          content={content}
        />
      );
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(title);
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  );

  function testBlockExplorerLink(txHash: string) {
    expect(screen.getByTestId('tx-block-explorer')).toHaveTextContent(
      'View in block explorer'
    );
    expect(screen.getByTestId('tx-block-explorer')).toHaveAttribute(
      'href',
      `https://test.explorer.vega.network/txs/0x${txHash}`
    );
  }
});
