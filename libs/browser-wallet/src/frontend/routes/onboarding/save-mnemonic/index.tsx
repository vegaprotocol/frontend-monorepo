import { useSuggestMnemonic } from '@/hooks/suggest-mnemonic';

import { MnemonicPage } from '../components/mnemonic-page';

export const locators = {
  saveMnemonicDescription: 'save-mnemonic-description',
};

export const SaveMnemonic = () => {
  const { mnemonic } = useSuggestMnemonic();
  return <MnemonicPage mnemonic={mnemonic} />;
};
