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
  const { pubKey } = useVegaWallet();
  const isConnected = pubKey !== null;

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
        <span className="text-ui-small font-mono mr-2">Vega key:</span>
      )}
      <button
        data-testid="connect-vega-wallet"
        onClick={handleClick}
        className="ml-auto inline-block text-ui-small font-mono hover:underline"
      >
        {isConnected ? truncateByChars(pubKey) : 'Connect Vega wallet'}
      </button>
    </span>
  );
};
