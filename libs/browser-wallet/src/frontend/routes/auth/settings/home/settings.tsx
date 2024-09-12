import { BasePage } from '@/components/pages/page';

import { DeleteWallet } from './sections/delete-wallet-section';
// import { ExportRecoveryPhraseSection } from './sections/export-recovery-phrase-section';
import { SettingsRadio } from './sections/radio-section';
// import { ExternalLink } from '@vegaprotocol/ui-toolkit';
// import { LockSection } from './sections/lock-section';

export const locators = {
  settingsPage: 'settings-page',
  settingsDataPolicy: 'settings-data-policy',
};

export const Settings = () => {
  return (
    <BasePage dataTestId={locators.settingsPage} title="Settings">
      {/* <ExportRecoveryPhraseSection /> */}
      <SettingsRadio
        description="Allow order and vote transaction types to be automatically sent to the network"
        sectionHeader="Automatic consent"
        setting="autoConsent"
      />
      <DeleteWallet />
      {/* <LockSection /> */}
    </BasePage>
  );
};
