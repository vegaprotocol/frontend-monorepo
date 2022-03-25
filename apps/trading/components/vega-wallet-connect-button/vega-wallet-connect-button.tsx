import { truncateByChars } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface VegaWalletButtonProps {
  setConnectDialog: (isOpen: boolean) => void;
  setManageDialog: (isOpen: boolean) => void;
}

export const VegaWalletConnectButton = ({
  setConnectDialog,
  setManageDialog,
}: VegaWalletButtonProps) => {
  const { keypair } = useVegaWallet();
  const isConnected = keypair !== null;

  const handleClick = () => {
    if (isConnected) {
      setManageDialog(true);
    } else {
      setConnectDialog(true);
    }
  };

  return (
    <button onClick={handleClick} className="ml-auto inline-block text-ui">
      {isConnected ? truncateByChars(keypair.pub) : 'Connect Vega wallet'}
    </button>
  );
};
