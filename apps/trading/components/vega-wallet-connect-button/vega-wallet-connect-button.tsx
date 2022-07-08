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
    <span>
      {isConnected && (
        <span className="text-ui-small font-mono mr-2 text-white-90">Vega key:</span>
      )}
      <button
        data-testid={isConnected ? 'manage-vega-wallet' : 'connect-vega-wallet'}
        onClick={handleClick}
        className="ml-auto inline-block text-ui-small font-mono hover:underline text-white-90"
      >
        {isConnected ? truncateByChars(keypair.pub) : 'Connect Vega wallet'}
      </button>
    </span>
  );
};
