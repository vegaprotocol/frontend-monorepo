import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

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
        <DropdownMenuTrigger
          className="text-white"
          data-testid="manage-vega-wallet"
        >
          <span className="uppercase">{keypair.name}</span>:{' '}
          {truncateByChars(keypair.pub)}
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
                <span className="uppercase">{kp.name}</span>:{' '}
                {truncateByChars(kp.pub)}
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
    <Button
      data-testid="connect-vega-wallet"
      onClick={() => setConnectDialog(true)}
      size="sm"
    >
      {t('Connect Vega wallet')}
    </Button>
  );
};
