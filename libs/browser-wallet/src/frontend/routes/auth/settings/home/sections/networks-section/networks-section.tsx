import { NavLink } from 'react-router-dom';

import { ChevronRight } from '@/components/icons/chevron-right';
import { SubHeader } from '@/components/sub-header';
import { VegaSection } from '@/components/vega-section';
import { FULL_ROUTES } from '@/routes/route-names';

export const locators = {
  viewNetworksButton: 'view-networks-button',
  viewNetworks: 'view-networks',
};

export const NetworksSection = () => {
  return (
    <VegaSection>
      <SubHeader content="Networks" />
      <div className="flex justify-between h-12">
        <div data-testid={locators.viewNetworks} className="flex items-center">
          View configured networks
        </div>
        <NavLink
          to={{ pathname: FULL_ROUTES.networksSettings }}
          data-testid={locators.viewNetworksButton}
          className="hover:bg-vega-dark-200 w-12 h-full border-l border-1 border-vega-dark-150 flex items-center justify-center"
        >
          <ChevronRight />
        </NavLink>
      </div>
    </VegaSection>
  );
};
