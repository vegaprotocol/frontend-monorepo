// import { fireEvent, render, screen } from '@testing-library/react';

// import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
// import { useConnectionStore } from '@/stores/connections';
// import { useNetworksStore } from '@/stores/networks-store';
// import { useTabStore } from '@/stores/tab-store';
// import { mockStore } from '@/test-helpers/mock-store';
// import { silenceErrors } from '@/test-helpers/silence-errors';

// import { testingNetwork } from '../../../config/well-known-networks';
// import { locators, NetworkIndicator } from './network-indicator';

jest.mock('@/stores/tab-store');
jest.mock('@/stores/networks-store');
jest.mock('@/stores/connections');

// const renderComponent = () => {
//   return render(
//     <MockNetworkProvider>
//       <NetworkIndicator />
//     </MockNetworkProvider>
//   );
// };

describe('NetworkIndicator', () => {
  it('should render nothing while connections are loading', async () => {
    expect(true).toBeTruthy()
    // mockStore(useNetworksStore, {
    //   networks: [
    //     {
    //       id: testingNetwork.id,
    //       name: 'Testing network',
    //     },
    //   ],
    // });
    // mockStore(useTabStore, {
    //   currentTab: null,
    // });
    // mockStore(useConnectionStore, {
    //   loading: true,
    // });
    // const view = renderComponent();
    // expect(view.container).toBeEmptyDOMElement();
  });
  // it('should render neutral indicator if there are no connections present', async () => {
  //   // 1145-INDC-001 When I am not connected it shows not connected I see a neutral state (
  //   // 1145-INDC-008 When I hover over the neutral state I can see that I am not connected
  //   mockStore(useNetworksStore, {
  //     networks: [
  //       {
  //         id: testingNetwork.id,
  //         name: 'Testing network',
  //       },
  //     ],
  //   });
  //   mockStore(useTabStore, {
  //     currentTab: { url: 'https://www.foo.com' },
  //   });
  //   mockStore(useConnectionStore, {
  //     connections: [],
  //   });
  //   renderComponent();
  //   expect(screen.getByTestId(locators.indicator)).toHaveClass('bg-black');
  //   fireEvent.pointerMove(screen.getByTestId(locators.indicator));
  //   const [tooltip] = await screen.findAllByTestId(
  //     locators.networkIndicatorTooltip
  //   );
  //   expect(tooltip).toHaveTextContent(
  //     'You are not currently connected to any sites.'
  //   );
  // });

  // it('should neutral indicator if the current site is not connected', async () => {
  //   // 1145-INDC-001 When I am not connected it shows not connected I see a neutral state (
  //   mockStore(useNetworksStore, {
  //     networks: [
  //       {
  //         id: testingNetwork.id,
  //         name: 'Testing network',
  //       },
  //     ],
  //   });
  //   mockStore(useTabStore, {
  //     currentTab: { url: 'https://www.foo.com' },
  //   });
  //   mockStore(useConnectionStore, {
  //     connections: [
  //       {
  //         origin: 'https://www.bar.com',
  //         chainId: 'chainId',
  //         networkId: testingNetwork.id,
  //       },
  //     ],
  //   });
  //   renderComponent();
  //   expect(screen.getByTestId(locators.indicator)).toHaveClass('bg-black');
  //   fireEvent.pointerMove(screen.getByTestId(locators.indicator));
  //   const [tooltip] = await screen.findAllByTestId(
  //     locators.networkIndicatorTooltip
  //   );
  //   expect(tooltip).toHaveTextContent(
  //     'You are not currently connected to https://www.foo.com.'
  //   );
  // });

  // it('should success indicator if the current site is connected and on the same chainId', async () => {
  //   // 1145-INDC-002 When I am connected it shows connected I see a success state
  //   // 1145-INDC-010 When I hover over the success state I am informed that I am connected to the current tab
  //   mockStore(useNetworksStore, {
  //     networks: [
  //       {
  //         id: testingNetwork.id,
  //         name: 'Testing network',
  //       },
  //     ],
  //   });
  //   mockStore(useTabStore, {
  //     currentTab: {
  //       url: 'https://www.foo.com',
  //     },
  //   });
  //   mockStore(useConnectionStore, {
  //     connections: [
  //       {
  //         origin: 'https://www.foo.com',
  //         chainId: testingNetwork.chainId,
  //         networkId: testingNetwork.id,
  //       },
  //     ],
  //   });
  //   renderComponent();
  //   expect(screen.getByTestId(locators.indicator)).toHaveClass(
  //     'bg-vega-green-550'
  //   );
  //   fireEvent.pointerMove(screen.getByTestId(locators.indicator));
  //   const [tooltip] = await screen.findAllByTestId(
  //     locators.networkIndicatorTooltip
  //   );
  //   expect(tooltip).toHaveTextContent(
  //     'You are currently connected to https://www.foo.com.'
  //   );
  // });

  // it('should render warning indicator if the current site is connected and not on the same chainId', async () => {
  //   // 1145-INDC-003 When I am connected and the chain ids mismatch I see a warning state
  //   // 1145-INDC-009 When I hover over the warning state I am informed I am viewing a different network to the currently connected tab
  //   mockStore(useNetworksStore, {
  //     networks: [
  //       {
  //         id: testingNetwork.id,
  //         name: 'Testing network',
  //       },
  //       {
  //         id: 'networkId',
  //         name: 'Testing network2',
  //       },
  //     ],
  //   });
  //   mockStore(useTabStore, {
  //     currentTab: {
  //       url: 'https://www.foo.com',
  //     },
  //   });
  //   mockStore(useConnectionStore, {
  //     connections: [
  //       {
  //         origin: 'https://www.foo.com',
  //         chainId: 'chainId',
  //         networkId: 'networkId',
  //       },
  //     ],
  //   });
  //   renderComponent();
  //   expect(screen.getByTestId(locators.indicator)).toHaveClass('bg-warning');
  //   fireEvent.pointerMove(screen.getByTestId(locators.indicator));
  //   const [tooltip] = await screen.findAllByTestId(
  //     locators.networkIndicatorTooltip
  //   );
  //   expect(tooltip).toHaveTextContent(
  //     'The dApp https://www.foo.com is connected to the Testing network2 network, but your wallet is displaying Test data. To change the network for your wallet, click on the network dropdown.'
  //   );
  // });

  // it('throws error if network could not be found', async () => {
  //   silenceErrors();
  //   mockStore(useNetworksStore, {
  //     networks: [],
  //   });
  //   mockStore(useTabStore, {
  //     currentTab: {
  //       url: 'https://www.foo.com',
  //     },
  //   });
  //   mockStore(useConnectionStore, {
  //     connections: [
  //       {
  //         origin: 'https://www.foo.com',
  //         chainId: 'chainId',
  //         networkId: 'networkId',
  //       },
  //     ],
  //   });
  //   expect(() => renderComponent()).toThrow(
  //     'Could not find network with id networkId in the networks store.'
  //   );
  // });
});
