import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { truncate } from 'lodash';

export interface VegaWalletConnectButtonProps {
  setConnectDialog: (isOpen: boolean) => void;
}

export const VegaWalletConnectButton = ({
  setConnectDialog,
}: VegaWalletConnectButtonProps) => {
  const { keypair, keypairs, selectPublicKey, disconnect } = useVegaWallet();
  const isConnected = keypair !== null;

  if (isConnected && keypairs) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="text-white">
          {keypair.name}: {truncateByChars(keypair.pub)}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={keypair.pub}
            onValueChange={(value) => {
              selectPublicKey(value);
            }}
          >
            {keypairs.map((kp) => (
              <DropdownMenuRadioItem key={kp.pub} value={kp.pub}>
                {kp.name}: {truncateByChars(kp.pub)}
                <DropdownMenuItemIndicator />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuItem onClick={disconnect}>
            {t('Disconnect')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <span className="text-sm">
      <button
        data-testid={isConnected ? 'manage-vega-wallet' : 'connect-vega-wallet'}
        onClick={() => setConnectDialog(true)}
        className="ml-auto font-mono hover:underline text-white"
      >
        {t('Connect Vega wallet')}
      </button>
    </span>
  );
};
