import { act, fireEvent, render, screen } from '@testing-library/react';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import { truncateByChars } from '@vegaprotocol/utils';
import userEvent from '@testing-library/user-event';
import {
  mockConfig,
  MockedWalletProvider,
} from '@vegaprotocol/wallet-react/testing';

jest.mock('../../lib/hooks/use-get-current-route-id', () => ({
  useGetCurrentRouteId: jest.fn().mockReturnValue('current-route-id'),
}));

const renderComponent = (mockOnClick = jest.fn()) => {
  return (
    <MockedWalletProvider>
      <VegaWalletConnectButton onClick={mockOnClick} />
    </MockedWalletProvider>
  );
};

describe('VegaWalletConnectButton', () => {
  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  it('should fire dialog when not connected', async () => {
    const onClick = jest.fn();
    render(renderComponent(onClick));
    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Get started');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('should render "Connect" when browser wallet is detected', async () => {
    window.vega = window.vega || ({} as Vega);
    render(renderComponent());
    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Connect');
  });

  it('should open dropdown and refresh keys when connected', async () => {
    const key = { publicKey: '123456__123456', name: 'test' };
    const key2 = { publicKey: 'abcdef__abcdef', name: 'test2' };
    const keys = [key, key2];

    mockConfig.store.setState({
      status: 'connected',
      keys,
      pubKey: key.publicKey,
    });

    const refreshKeys = jest.spyOn(mockConfig, 'refreshKeys');
    const disconnect = jest.spyOn(mockConfig, 'disconnect');
    const setPubKey = jest.spyOn(mockConfig.store, 'setState');

    render(renderComponent());

    expect(screen.queryByTestId('connect-vega-wallet')).not.toBeInTheDocument();
    const button = screen.getByTestId('manage-vega-wallet');
    expect(button).toHaveTextContent(truncateByChars(key.publicKey));

    fireEvent.click(button);

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(await screen.findAllByRole('menuitemradio')).toHaveLength(
      keys.length
    );
    expect(refreshKeys).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId(`key-${key2.publicKey}`));
    expect(setPubKey).toHaveBeenCalledWith({ pubKey: key2.publicKey });

    fireEvent.click(screen.getByTestId('disconnect'));
    expect(disconnect).toHaveBeenCalled();
  });
});
