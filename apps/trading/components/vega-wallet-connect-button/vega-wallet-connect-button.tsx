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
  Icon,
} from '@vegaprotocol/ui-toolkit';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export interface VegaWalletConnectButtonProps {
  setConnectDialog: (isOpen: boolean) => void;
}

export const VegaWalletConnectButton = ({
  setConnectDialog,
}: VegaWalletConnectButtonProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { keypair, keypairs, selectPublicKey, disconnect } = useVegaWallet();
  const isConnected = keypair !== null;

  if (isConnected && keypairs) {
    return (
      <DropdownMenu open={dropdownOpen}>
        <DropdownMenuTrigger
          className="text-white hover:border-white hover:!bg-neutral-700 focus:!border-white focus-visible:!bg-neutral-700"
          data-testid="manage-vega-wallet"
          onClick={() => setDropdownOpen((curr) => !curr)}
        >
          <span className="uppercase">{keypair.name}</span>:{' '}
          {truncateByChars(keypair.pub)}
        </DropdownMenuTrigger>
        <DropdownMenuContent onInteractOutside={() => setDropdownOpen(false)}>
          <div className="min-w-[340px]" data-testid="keypair-list">
            <DropdownMenuRadioGroup
              value={keypair.pub}
              onValueChange={(value) => {
                selectPublicKey(value);
              }}
            >
              {keypairs.map((kp) => (
                <KeypairItem key={kp.pub} kp={kp} />
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuItem data-testid="disconnect" onClick={disconnect}>
              {t('Disconnect')}
            </DropdownMenuItem>
          </div>
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
      <span className="whitespace-nowrap">{t('Connect Vega wallet')}</span>
    </Button>
  );
};

const KeypairItem = ({ kp }: { kp: VegaKeyExtended }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line
    let timeout: any;

    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 800);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <DropdownMenuRadioItem key={kp.pub} value={kp.pub}>
      <div className="flex-1 mr-2" data-testid={`key-${kp.pub}`}>
        <span className="mr-2">
          <span className="uppercase">{kp.name}</span>:{' '}
          <span>{truncateByChars(kp.pub)}</span>
        </span>
        <span>
          <CopyToClipboard text={kp.pub} onCopy={() => setCopied(true)}>
            <button
              data-testid="copy-vega-public-key"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">{t('Copy')}</span>
              <Icon name="duplicate" className="mr-2" />
            </button>
          </CopyToClipboard>
          {copied && (
            <span className="text-xs text-neutral-500">{t('Copied')}</span>
          )}
        </span>
      </div>
      <DropdownMenuItemIndicator />
    </DropdownMenuRadioItem>
  );
};
