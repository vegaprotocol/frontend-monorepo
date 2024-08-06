import { useNavigate } from 'react-router-dom';

import { NetworksList } from '@/components/networks-list';
import { BasePage } from '@/components/pages/page';
import { FULL_ROUTES } from '@/routes/route-names';
import { useNetworksStore } from '@/stores/networks-store';

export const locators = {
  networkSettingsPage: 'network-settings-page',
};

export const NetworkSettings = () => {
  const { networks } = useNetworksStore((state) => ({
    networks: state.networks,
  }));
  const navigate = useNavigate();
  return (
    <BasePage
      dataTestId={locators.networkSettingsPage}
      title="Network settings"
      backLocation={FULL_ROUTES.settings}
    >
      <NetworksList
        networks={networks}
        onClick={(n) => navigate(`${FULL_ROUTES.networksSettings}/${n.id}`)}
      />
    </BasePage>
  );
};
