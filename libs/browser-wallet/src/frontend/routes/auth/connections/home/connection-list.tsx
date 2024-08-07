import { NavLink } from 'react-router-dom';

import { HostImage } from '@/components/host-image';
import { ChevronRight } from '@/components/icons/chevron-right';
import { List } from '@/components/list';
import { FULL_ROUTES } from '@/routes/route-names';
import type { Connection } from '@/types/backend';

export const locators = {
  connectionDetails: 'connection-details',
  connectionOrigin: 'connections-connection',
  connectionDetailsView: 'connection-details-view',
};

export interface ConnectionsListProperties {
  connections: Connection[];
}

export const ConnectionsList = ({ connections }: ConnectionsListProperties) => {
  return (
    <>
      <p className="mb-6 text-sm" data-testid={locators.connectionDetails}>
        These dapps have access to your public keys and permission to send
        transaction requests.
      </p>
      <List<Connection>
        className="mt-2"
        idProp="origin"
        items={connections}
        renderItem={(connection) => (
          <div>
            <div className="flex justify-between h-12">
              <div className="flex flex-col justify-center">
                <HostImage size={42} hostname={connection.origin} />
              </div>
              <div
                data-testid={locators.connectionOrigin}
                className="ml-4 flex-1 flex flex-col justify-center overflow-hidden break-all"
              >
                {connection.origin}
              </div>
              <NavLink
                data-testid={locators.connectionDetailsView}
                className="hover:bg-vega-dark-200 w-12 h-full border-l border-1 border-vega-dark-150 flex items-center justify-center"
                to={`${FULL_ROUTES.connections}/${encodeURIComponent(
                  connection.origin
                )}`}
              >
                <ChevronRight />
              </NavLink>
            </div>
          </div>
        )}
      />
    </>
  );
};
