import { AsyncRenderer } from '@/components/async-renderer';
import { ExternalLink } from '@/components/external-link';
import { Frame } from '@/components/frame';
import { BasePage } from '@/components/pages/page';
import { useNetwork } from '@/contexts/network/network-context';
import { useConnectionStore } from '@/stores/connections';

import { ConnectionsList } from './connection-list';
import { NoAppsConnected } from './no-dapps-connected';

export const locators = {
  connectionInstructions: 'connection-instructions',
  connectionInstructionsLink: 'connection-instructions-link',
  connectionsHeader: 'connections-header',
};

export const Connections = () => {
  const { network } = useNetwork();
  const { connections } = useConnectionStore((state) => ({
    connections: state.connections,
  }));

  return (
    <BasePage dataTestId={locators.connectionsHeader} title="Connections">
      <AsyncRenderer
        noData={connections.length === 0}
        renderNoData={() => (
          <div className="mt-6">
            <NoAppsConnected />
          </div>
        )}
        render={() => (
          <div className="mt-6">
            <ConnectionsList connections={connections} />
          </div>
        )}
      />
      <div className="mt-6">
        <Frame>
          <p data-testid={locators.connectionInstructions}>
            Trying to connect to a{' '}
            <ExternalLink
              data-testid={locators.connectionInstructionsLink}
              className="underline"
              href={network.vegaDapps}
            >
              <span>Vega dapp?</span>
            </ExternalLink>{' '}
            Look for the "Connect Wallet" button and press it to create a
            connection.
          </p>
        </Frame>
      </div>
    </BasePage>
  );
};
