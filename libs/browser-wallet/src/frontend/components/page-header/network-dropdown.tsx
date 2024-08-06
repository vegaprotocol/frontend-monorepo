import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useNetwork } from '@/contexts/network/network-context';
import { useGlobalsStore } from '@/stores/globals';
import { useNetworksStore } from '@/stores/networks-store';

import { Dropdown } from '../dropdown';
import { Header } from '../header';
import { NetworksList } from '../networks-list';

export const locators = {
  networkSwitcherCurrentNetwork: 'network-switcher-current-network',
  networkSwitcherMessage: 'network-switcher-message',
};

export const NetworkDropdown = () => {
  const { request } = useJsonRpcClient();
  const { networks, setSelectedNetwork } = useNetworksStore((state) => ({
    networks: state.networks,
    setSelectedNetwork: state.setSelectedNetwork,
  }));
  const { network } = useNetwork();
  const { loadGlobals, globals } = useGlobalsStore((state) => ({
    loadGlobals: state.loadGlobals,
    globals: state.globals,
  }));

  const displayNetworks = networks.filter(
    (n) => globals?.settings.showHiddenNetworks || !n.hidden
  );

  return (
    <Dropdown
      enabled={networks.length > 1}
      trigger={
        <div data-testid={locators.networkSwitcherCurrentNetwork}>
          {network.name}
        </div>
      }
      content={() => (
        <div>
          <Header content="Select a network to view" />
          <p
            data-testid={locators.networkSwitcherMessage}
            className="text-vega-dark-300 mt-4"
          >
            Your selected network is for display purposes only, you can connect
            and place transactions on any configured network regardless of what
            network you have selected.
          </p>
          <NetworksList
            networks={displayNetworks}
            onClick={async (n) => {
              await setSelectedNetwork(request, n.id);
              await loadGlobals(request);
            }}
          />
        </div>
      )}
    />
  );
};
