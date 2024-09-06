import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  connectError,
  ConnectorErrors,
  createConfig,
  InjectedConnector,
  mockChain,
  MockConnector,
  userRejectedError,
  type Wallet,
} from '@vegaprotocol/wallet';
import { MockedWalletProvider } from '../../../testing';
import { ConnectDialog, DIALOG_CLOSE_DELAY } from './connect-dialog';

describe('ConnectDialog', () => {
  const defaultProps = {
    open: true,
    onChange: jest.fn(),
  };
  let mock: MockConnector;
  let config: Wallet;

  beforeEach(() => {
    mock = new MockConnector();
    config = createConfig({
      chains: [mockChain],
      defaultChainId: mockChain.id,
      connectors: [mock, new InjectedConnector()],
    });
  });

  const renderComponent = (
    props?: Partial<typeof ConnectDialog>,
    config?: Wallet
  ) => {
    return {
      user: userEvent.setup(),
      ...render(
        <MockedWalletProvider config={config}>
          <ConnectDialog {...defaultProps} {...props} />
        </MockedWalletProvider>
      ),
    };
  };

  it('connects and closes after 1 second', async () => {
    const mockOnChange = jest.fn();
    const { user } = renderComponent({ onChange: mockOnChange }, config);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const list = screen.getByTestId('connectors-list');
    expect(list).toBeInTheDocument();
    expect(within(list).getAllByTestId(/connector-/)).toHaveLength(
      config.connectors.length
    );

    await user.click(screen.getByTestId(`connector-${mock.id}`));

    expect(within(dialog).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Successfully connected'
    );

    await new Promise((resolve) => setTimeout(resolve, DIALOG_CLOSE_DELAY));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('doesnt show user rejected error', async () => {
    jest
      .spyOn(mock, 'connectWallet')
      .mockRejectedValueOnce(userRejectedError());

    const props = {
      open: true,
      onChange: jest.fn(),
    };

    const { user } = renderComponent(props, config);

    const dialog = within(screen.getByRole('dialog'));

    await user.click(dialog.getByTestId(`connector-${mock.id}`));

    expect(dialog.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByTestId('connection-error')).not.toBeInTheDocument();
    expect(screen.getByTestId('connectors-list')).toBeInTheDocument();
  });

  it('shows error', async () => {
    jest.spyOn(mock, 'connectWallet').mockRejectedValueOnce(connectError());

    const props = {
      open: true,
      onChange: jest.fn(),
    };

    const { user } = renderComponent(props, config);

    const dialog = within(screen.getByRole('dialog'));

    await user.click(dialog.getByTestId(`connector-${mock.id}`));

    expect(dialog.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.getByTestId('connection-error')).toHaveTextContent(
      ConnectorErrors.connect.message
    );
    expect(screen.getByTestId('connectors-list')).toBeInTheDocument();
  });
});
