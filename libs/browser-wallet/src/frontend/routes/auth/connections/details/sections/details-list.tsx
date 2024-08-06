import { NavLink } from 'react-router-dom';

import { SubHeader } from '@/components/sub-header';
import { VegaSection } from '@/components/vega-section';
import { formatDateTime } from '@/lib/utils';
import { FULL_ROUTES } from '@/routes/route-names';
import type { Connection } from '@/types/backend';

export const locators = {
  accessedAt: 'accessed-at',
  origin: 'origin',
  chainId: 'chain-id',
  networkId: 'network-id',
};

export const DetailsSection = ({ connection }: { connection: Connection }) => {
  return (
    <>
      <VegaSection>
        <SubHeader content="Origin" />
        <div className="text-white mt-1" data-testid={locators.origin}>
          {connection.origin}
        </div>
      </VegaSection>
      <VegaSection>
        <SubHeader content="Last accessed" />
        <div className="text-white mt-1" data-testid={locators.accessedAt}>
          {formatDateTime(connection.accessedAt)}
        </div>
      </VegaSection>
      <VegaSection>
        <SubHeader content="Chain Id" />
        <div className="text-white mt-1" data-testid={locators.chainId}>
          {connection.chainId}
        </div>
      </VegaSection>
      <VegaSection>
        <SubHeader content="Network Id" />
        <div className="mt-1">
          <NavLink
            data-testid={locators.networkId}
            className="text-white underline"
            to={`${FULL_ROUTES.networksSettings}/${connection.networkId}`}
          >
            {connection.networkId}
          </NavLink>
        </div>
      </VegaSection>
    </>
  );
};
