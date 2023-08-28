import { render, screen } from '@testing-library/react';
import { WalletError } from '../connectors';
import type { VegaWalletConfig } from '../provider';
import { VegaWalletProvider } from '../provider';
import { VegaTxStatus } from '../use-vega-transaction';
import type { VegaTransactionDialogProps } from './vega-transaction-dialog';
import { VegaTransactionDialog } from './vega-transaction-dialog';

describe('VegaTransactionDialog', () => {
  const defaultConfig: VegaWalletConfig = {
    network: 'TESTNET',
    vegaUrl: 'https://vega.xyz',
    vegaWalletServiceUrl: 'https://vegaservice.xyz',
    links: {
      explorer: 'explorer-link',
      concepts: 'concepts-link',
      chromeExtensionUrl: 'chrome-link',
      mozillaExtensionUrl: 'mozilla-link',
    },
  };

  const props: VegaTransactionDialogProps = {
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

  const renderComponent = (testProps?: Partial<VegaTransactionDialogProps>) => {
    return render(
      <VegaWalletProvider config={defaultConfig}>
        <VegaTransactionDialog {...props} {...testProps} />
      </VegaWalletProvider>
    );
  };

  it('requested', () => {
    renderComponent();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/confirm/i);
    expect(screen.getByTestId(VegaTxStatus.Requested)).toHaveTextContent(
      /please open your wallet/i
    );
    expect(screen.getByTestId('testnet-transaction-info')).toHaveTextContent(
      /^\[This is TESTNET transaction only\]$/
    );
  });

  it('pending', () => {
    renderComponent({
      transaction: {
        ...props.transaction,
        txHash: 'tx-hash',
        status: VegaTxStatus.Pending,
      },
    });
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/awaiting/i);
    expect(screen.getByTestId(VegaTxStatus.Pending)).toHaveTextContent(
      /please wait/i
    );
    testBlockExplorerLink('tx-hash');
  });

  it('error', () => {
    renderComponent({
      transaction: {
        ...props.transaction,
        error: new WalletError('rejected', 1),
        status: VegaTxStatus.Error,
      },
    });
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(/failed/i);
    expect(screen.getByTestId(VegaTxStatus.Error)).toHaveTextContent(
      /rejected/i
    );
  });

  it('default complete', () => {
    renderComponent({
      transaction: {
        ...props.transaction,
        txHash: 'tx-hash',
        status: VegaTxStatus.Complete,
      },
    });
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
      renderComponent({
        transaction: {
          ...props.transaction,
          txHash: 'tx-hash',
          status: status as VegaTxStatus,
        },
        title: title,
        content: content,
      });
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
      `${defaultConfig.links.explorer}/txs/0x${txHash}`
    );
  }
});
