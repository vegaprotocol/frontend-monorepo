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
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export const VegaWalletConnectButton = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { updateDialogOpen } = useVegaWalletDialogStore((store) => ({
    updateDialogOpen: store.updateDialogOpen,
  }));
  const { pubKey, pubKeys, selectPubKey, disconnect } = useVegaWallet();
  const isConnected = pubKey !== null;

  const activeKey = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  if (isConnected && pubKeys) {
    return (
      <DropdownMenu open={dropdownOpen}>
        <DropdownMenuTrigger
          data-testid="manage-vega-wallet"
          onClick={() => setDropdownOpen((curr) => !curr)}
        >
          {activeKey && <span className="uppercase">{activeKey.name}</span>}
          {': '}
          {truncateByChars(pubKey)}
        </DropdownMenuTrigger>
        <DropdownMenuContent onInteractOutside={() => setDropdownOpen(false)}>
          <div className="min-w-[340px]" data-testid="keypair-list">
            <DropdownMenuRadioGroup
              value={pubKey}
              onValueChange={(value) => {
                selectPubKey(value);
              }}
            >
              {pubKeys.map((k) => (
                <KeypairItem key={k.publicKey} kp={k.publicKey} />
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
      onClick={() => updateDialogOpen(true)}
      size="sm"
    >
      <span className="whitespace-nowrap">{t('Connect Vega wallet')}</span>
    </Button>
  );
};

const KeypairItem = ({ kp }: { kp: string }) => {
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
    <DropdownMenuRadioItem key={kp} value={kp}>
      <div className="flex-1 mr-2" data-testid={`key-${kp}`}>
        <span className="mr-2">
          <span>{truncateByChars(kp)}</span>
        </span>
        <span>
          <CopyToClipboard text={kp} onCopy={() => setCopied(true)}>
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
