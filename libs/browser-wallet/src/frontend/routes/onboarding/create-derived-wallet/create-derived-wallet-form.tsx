import { useDeriveMnemonic } from '@/hooks/suggest-mnemonic';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { useChainId } from 'wagmi';
import { CreateDerivedWalletPage } from './create-derived-wallet-page';

export const CreateDerivedWalletForm = ({
  setMnemonic,
}: {
  setMnemonic: (mnemonic: string) => void;
}) => {
  const chainId = useChainId();
  const { derivedMnemonic, loading, error } = useDeriveMnemonic(chainId);
  const onClick = async () => {
    const result = await derivedMnemonic();
    setMnemonic(result);
  };
  return (
    <CreateDerivedWalletPage>
      <div className="text-center">
        <Button variant="primary" disabled={!!loading} onClick={onClick}>
          Create Derived Wallet
        </Button>
        {error && <InputError>{error}</InputError>}
      </div>
    </CreateDerivedWalletPage>
  );
};
