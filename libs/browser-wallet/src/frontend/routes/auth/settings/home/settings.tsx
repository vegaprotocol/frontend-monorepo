import { BasePage } from '@/components/pages/page';

import { DeleteWallet } from './sections/delete-wallet-section';
import { ExportRecoveryPhraseSection } from './sections/export-recovery-phrase-section';
// import { LockSection } from './sections/lock-section';

export const locators = {
  settingsPage: 'settings-page',
  settingsDataPolicy: 'settings-data-policy',
};

export const Settings = () => {
  return (
    <BasePage dataTestId={locators.settingsPage} title="Settings">
      <ExportRecoveryPhraseSection />
      <DeleteWallet />
      {/* <LockSection /> */}
    </BasePage>
  );
};
