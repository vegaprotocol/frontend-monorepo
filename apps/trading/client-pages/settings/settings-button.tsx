import { Icon, NavigationItem, NavigationLink } from '@vegaprotocol/ui-toolkit';
import { Links, Routes } from '../../pages/client-router';
import { COG } from '@blueprintjs/icons/src/generated/iconNames';

export const SettingsButton = () => {
  return (
    <NavigationItem>
      <NavigationLink data-testid="Settings" to={Links[Routes.SETTINGS]()}>
        <Icon name={COG} className="!align-middle" />
      </NavigationLink>
    </NavigationItem>
  );
};
