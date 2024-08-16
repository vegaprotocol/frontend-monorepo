import { useDerivedMnemonic } from '@/hooks/suggest-mnemonic';

import { MnemonicPage } from '../components/mnemonic-page';
import { useAccount, useChainId } from 'wagmi';
export const locators = {
  saveMnemonicDescription: 'save-mnemonic-description',
};

export const CreateDerivedWallet = () => {
  // TODO fill in with a real account
  const chainId = useChainId();
  const { address } = useAccount();
  const { mnemonic } = useDerivedMnemonic(address, chainId);
  return <MnemonicPage mnemonic={mnemonic} />;
};
