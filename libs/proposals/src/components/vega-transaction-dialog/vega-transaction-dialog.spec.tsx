import { render, screen } from '@testing-library/react';
import { WalletError } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '../../lib/proposals-hooks/use-vega-transaction';
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
  const walletContext = {
    network: 'TESTNET',
    links: {
      explorer: 'explorer',
    },
  } as VegaWalletContextShape;
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
    render(
      <VegaWalletContext.Provider value={walletContext}>
        <VegaTransactionDialog {...props} />
      </VegaWalletContext.Provider>
    );
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
      <VegaWalletContext.Provider value={walletContext}>
        <VegaTransactionDialog
          {...props}
          transaction={{
            ...props.transaction,
            txHash: 'tx-hash',
            status: VegaTxStatus.Pending,
          }}
        />
      </VegaWalletContext.Provider>
    );
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/awaiting/i);
    expect(screen.getByTestId(VegaTxStatus.Pending)).toHaveTextContent(
      /please wait/i
    );
    testBlockExplorerLink('tx-hash');
  });

  it('error', () => {
    render(
      <VegaWalletContext.Provider value={walletContext}>
        <VegaTransactionDialog
          {...props}
          transaction={{
            ...props.transaction,
            error: new WalletError('rejected', 1),
            status: VegaTxStatus.Error,
          }}
        />
      </VegaWalletContext.Provider>
    );
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/failed/i);
    expect(screen.getByTestId(VegaTxStatus.Error)).toHaveTextContent(
      /rejected/i
    );
  });

  it('default complete', () => {
    render(
      <VegaWalletContext.Provider value={walletContext}>
        <VegaTransactionDialog
          {...props}
          transaction={{
            ...props.transaction,
            txHash: 'tx-hash',
            status: VegaTxStatus.Complete,
          }}
        />
      </VegaWalletContext.Provider>
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
        <VegaWalletContext.Provider value={walletContext}>
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
        </VegaWalletContext.Provider>
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
      `${walletContext.links.explorer}/txs/0x${txHash}`
    );
  }
});
