import config from '!/config';
import { ExternalLink } from '@/components/external-link';
import { BasePage } from '@/components/pages/page';
import { useGlobalsStore } from '@/stores/globals';

import { DeleteWallet } from './sections/delete-wallet-section';
import { ExportRecoveryPhraseSection } from './sections/export-recovery-phrase-section';
import { LockSection } from './sections/lock-section';
import { NetworksSection } from './sections/networks-section';
import { SettingsRadio } from './sections/radio-section';
import { VersionSection } from './sections/version-section';

export const locators = {
  settingsPage: 'settings-page',
  settingsDataPolicy: 'settings-data-policy',
};

export const Settings = () => {
  const isDesktop = useGlobalsStore((state) => !state.isMobile);

  return (
    <BasePage dataTestId={locators.settingsPage} title="Settings">
      <VersionSection />
      <SettingsRadio
        description="Improve Vega Wallet by automatically reporting bugs and crashes."
        sectionHeader="Telemetry"
        setting="telemetry"
      >
        <ExternalLink
          data-testid={locators.settingsDataPolicy}
          className="text-white mt-4"
          href={config.userDataPolicy}
        >
          Read Vega Wallet's user data policy
        </ExternalLink>
      </SettingsRadio>

      <SettingsRadio
        description="Show Vega development networks"
        sectionHeader="Enable development networks"
        setting="showHiddenNetworks"
      />

      {isDesktop && (
        <SettingsRadio
          description="Automatically open the wallet when a dApp requests to connect or sends a transaction."
          sectionHeader="Auto Open"
          setting="autoOpen"
        />
      )}
      <NetworksSection />

      <ExportRecoveryPhraseSection />

      <DeleteWallet />

      <LockSection />
    </BasePage>
  );
};
