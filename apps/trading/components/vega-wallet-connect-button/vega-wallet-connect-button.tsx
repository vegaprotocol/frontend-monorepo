import { truncateByChars } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';

export interface VegaWalletConnectButtonProps {
  setConnectDialog: (isOpen: boolean) => void;
  setManageDialog: (isOpen: boolean) => void;
}

export const VegaWalletConnectButton = ({
  setConnectDialog,
  setManageDialog,
}: VegaWalletConnectButtonProps) => {
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
    <span className="text-sm">
      {isConnected && (
        <span className="font-mono mr-2 text-white">Vega key:</span>
      )}
      <button
        data-testid={isConnected ? 'manage-vega-wallet' : 'connect-vega-wallet'}
        onClick={handleClick}
        className="ml-auto font-mono hover:underline text-white"
      >
        {isConnected ? truncateByChars(keypair.pub) : 'Connect Vega wallet'}
      </button>
    </span>
  );
};
