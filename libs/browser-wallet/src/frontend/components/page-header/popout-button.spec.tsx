import { render, screen } from '@testing-library/react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
// import config from '@/lib/config';
import { useGlobalsStore } from '@/stores/globals';
import { useNetworksStore } from '@/stores/networks-store';
import { usePopoverStore } from '@/stores/popover-store';
import { mockStore } from '@/test-helpers/mock-store';

import { testingNetwork } from '../../../config/well-known-networks';
import { PageHeader } from './page-header';
import { locators } from './popout-button';

jest.mock('@/stores/popover-store');
jest.mock('@/stores/globals');
jest.mock('@/stores/networks-store');

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: jest.fn(),
}));

const mockStores = (isPopoverInstance: boolean, isMobile = false) => {
  mockStore(useGlobalsStore, {
    isMobile,
  });
  mockStore(useNetworksStore, {
    networks: [testingNetwork],
    selectedNetwork: testingNetwork,
    setSelectedNetwork: jest.fn(),
  });
  const focusPopover = jest.fn();
  mockStore(usePopoverStore, {
    isPopoverInstance,
    focusPopover,
  });
  return focusPopover;
};

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <PageHeader />
    </MockNetworkProvider>
  );

describe('PopoutButton', () => {
  // it('when opening in new window closes the window if config.closeWindowOnPopupOpen is true', async () => {
  //   mockStores(false);
  //   config.closeWindowOnPopupOpen = true;
  //   global.close = jest.fn();

  //   const mockRequest = jest.fn();
  //   (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
  //     request: mockRequest,
  //   });
  //   renderComponent();

  //   fireEvent.click(screen.getByTestId(locators.openPopoutButton));

  //   await waitFor(() => expect(global.close).toHaveBeenCalled());
  // });

  // it('when opening in new window does not close the window if config.closeWindowOnPopupOpen is false', async () => {
  //   mockStores(false);
  //   config.closeWindowOnPopupOpen = false;
  //   global.close = jest.fn();

  //   const mockRequest = jest.fn();
  //   (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
  //     request: mockRequest,
  //   });
  //   renderComponent();

  //   fireEvent.click(screen.getByTestId(locators.openPopoutButton));

  //   await waitFor(() => expect(global.close).not.toHaveBeenCalled());
  // });

  // it('renders close button if popover is open', async () => {
  //   const mockClose = mockStores(true, false);
  //   const mockRequest = jest.fn();
  //   (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
  //     request: mockRequest,
  //   });
  //   renderComponent();

  //   fireEvent.click(screen.getByTestId(locators.openPopoutButton));

  //   await waitFor(() => expect(mockClose).toHaveBeenCalled());
  // });
  // it('does not render open in new window if feature is turned off', async () => {
  //   mockStores(true);
  //   config.features = {
  //     popoutHeader: false,
  //   };
  //   const mockRequest = jest.fn();
  //   (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
  //     request: mockRequest,
  //   });
  //   renderComponent();

  //   expect(
  //     screen.queryByTestId(locators.openPopoutButton)
  //   ).not.toBeInTheDocument();
  // });
  // it('does not render open in new window if feature is not defined', async () => {
  //   mockStores(true);
  //   config.features = undefined;
  //   const mockRequest = jest.fn();
  //   (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
  //     request: mockRequest,
  //   });
  //   renderComponent();

  //   expect(
  //     screen.queryByTestId(locators.openPopoutButton)
  //   ).not.toBeInTheDocument();
  // });

  it('does not render popout button when in mobile', async () => {
    mockStores(true, true);
    const mockRequest = jest.fn();
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
    renderComponent();

    expect(
      screen.queryByTestId(locators.openPopoutButton)
    ).not.toBeInTheDocument();
  });
});
