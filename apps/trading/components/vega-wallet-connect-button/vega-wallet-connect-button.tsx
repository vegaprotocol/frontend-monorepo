import { useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  VegaIcon,
  VegaIconNames,
  TradingButton as Button,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import type { PubKey } from '@vegaprotocol/wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import { ViewType, useSidebar } from '../sidebar';

export const VegaWalletConnectButton = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const setView = useSidebar((store) => store.setView);
  const {
    pubKey,
    pubKeys,
    selectPubKey,
    disconnect,
    isReadOnly,
    fetchPubKeys,
  } = useVegaWallet();
  const isConnected = pubKey !== null;

  const activeKey = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  if (isConnected && pubKeys) {
    return (
      <DropdownMenu
        open={dropdownOpen}
        trigger={
          <DropdownMenuTrigger
            data-testid="manage-vega-wallet"
            onClick={() => {
              if (fetchPubKeys) {
                fetchPubKeys();
              }
              setDropdownOpen(!dropdownOpen);
            }}
          >
            {activeKey && <span className="uppercase">{activeKey.name}</span>}
            {': '}
            {truncateByChars(pubKey)}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent
          onInteractOutside={() => setDropdownOpen(false)}
          sideOffset={12}
          side="bottom"
          align="end"
          onEscapeKeyDown={() => setDropdownOpen(false)}
        >
          <div className="min-w-[340px]" data-testid="keypair-list">
            <DropdownMenuRadioGroup
              value={pubKey}
              onValueChange={(value) => {
                selectPubKey(value);
              }}
            >
              {pubKeys.map((pk) => (
                <KeypairItem key={pk.publicKey} pk={pk} />
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            {!isReadOnly && (
              <DropdownMenuItem
                data-testid="wallet-transfer"
                onClick={() => {
                  setView({ type: ViewType.Transfer });
                  setDropdownOpen(false);
                }}
              >
                {t('Transfer')}
              </DropdownMenuItem>
            )}
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
      onClick={openVegaWalletDialog}
      size="small"
      intent={Intent.None}
    >
      <span className="whitespace-nowrap">{t('Connect Vega wallet')}</span>
    </Button>
  );
};

const KeypairItem = ({ pk }: { pk: PubKey }) => {
  const [copied, setCopied] = useCopyTimeout();

  return (
    <DropdownMenuRadioItem value={pk.publicKey}>
      <div className="flex-1 mr-2" data-testid={`key-${pk.publicKey}`}>
        <span className="mr-2">
          <span>
            <span className="uppercase">{pk.name}</span>:{' '}
            {truncateByChars(pk.publicKey)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1">
          <CopyToClipboard text={pk.publicKey} onCopy={() => setCopied(true)}>
            <button
              data-testid="copy-vega-public-key"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">{t('Copy')}</span>
              <VegaIcon name={VegaIconNames.COPY} />
            </button>
          </CopyToClipboard>
          {copied && <span className="text-xs">{t('Copied')}</span>}
        </span>
      </div>
      <DropdownMenuItemIndicator />
    </DropdownMenuRadioItem>
  );
};
