import { Icon, NavigationLink } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { Links, Routes } from '../../pages/client-router';
import { COG } from '@blueprintjs/icons/src/generated/iconNames';

export const SettingsButton = ({ withMobile }: { withMobile?: boolean }) => {
  return (
    <NavigationLink data-testid="Settings" to={Links[Routes.SETTINGS]()}>
      {withMobile ? (
        t('Settings')
      ) : (
        <Icon name={COG} className="!align-middle" />
      )}
    </NavigationLink>
  );
};
