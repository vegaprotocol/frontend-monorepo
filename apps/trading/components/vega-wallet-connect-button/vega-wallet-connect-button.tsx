import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { truncateByChars } from '@vegaprotocol/utils';
import {
  VegaIcon,
  VegaIconNames,
  Button,
  Intent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  Tooltip,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import {
  isBrowserWalletInstalled,
  QuickStartConnector,
  type Key,
} from '@vegaprotocol/wallet';
import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { useProfileDialogStore } from '../../stores/profile-dialog-store';
import { useBrowserWalletDialogStore } from '../browser-wallet-dialog';
import { usePartyProfiles } from '../../lib/hooks/use-party-profiles';
import { useShareDialogStore } from '../share-dialog';

export const VegaWalletConnectButton = ({
  intent = Intent.Primary,
  onClick,
}: {
  intent?: Intent;
  onClick?: () => void;
}) => {
  const t = useT();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const {
    status,
    pubKeys,
    pubKey,
    selectPubKey,
    disconnect,
    refreshKeys,
    isReadOnly,
    current,
    currentConnector,
  } = useVegaWallet();

  const walletInstalled = isBrowserWalletInstalled();

  const activeKey = pubKeys?.find((pk) => pk.publicKey === pubKey);
  const set = useBrowserWalletDialogStore((store) => store.set);

  const setShareDialogOpen = useShareDialogStore((state) => state.setOpen);

  if (status === 'connected') {
    return (
      <DropdownMenu
        open={dropdownOpen}
        trigger={
          <DropdownMenuTrigger
            data-testid="manage-vega-wallet"
            onClick={() => {
              refreshKeys();
              setDropdownOpen((x) => !x);
            }}
          >
            <Button
              size="sm"
              icon={<VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />}
            >
              {activeKey ? (
                <>
                  {activeKey && (
                    <span className="uppercase">
                      {activeKey.name ? activeKey.name : t('Unnamed key')}
                    </span>
                  )}
                </>
              ) : (
                <>{'Select key'}</>
              )}
            </Button>
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
          <div
            className="min-w-[340px] overflow-auto"
            data-testid="keypair-list"
            style={{ maxHeight: 'var(--radix-popper-available-height)' }}
          >
            {currentConnector instanceof QuickStartConnector &&
            currentConnector.ethAddress ? (
              <div className="px-2">
                {
                  <Tooltip
                    description={t(
                      'The Etherum key used to create the connected wallet'
                    )}
                  >
                    <span className="text-xs text-surface-0-fg-muted">
                      Derived from:{' '}
                      {truncateMiddle(currentConnector.ethAddress)}
                    </span>
                  </Tooltip>
                }
              </div>
            ) : null}
            <KeypairRadioGroup
              pubKey={pubKey}
              pubKeys={pubKeys}
              activeKey={activeKey?.publicKey}
              onSelect={selectPubKey}
              isReadOnly={isReadOnly}
            />
            <DropdownMenuSeparator />
            {['embedded-wallet-quickstart', 'embedded-wallet'].includes(
              current ?? ''
            ) && (
              <DropdownMenuItem
                data-testid="open-wallet"
                onClick={() => set(true)}
              >
                {t('Open Wallet')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setShareDialogOpen(true);
              }}
            >
              {t('SHARE_INVITE_FRIENDS')}
            </DropdownMenuItem>
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
      onClick={() => {
        onClick?.();
        openVegaWalletDialog();
      }}
      size="sm"
      intent={intent}
      icon={<VegaIcon name={VegaIconNames.ARROW_RIGHT} size={14} />}
    >
      <span className="whitespace-nowrap uppercase">
        {walletInstalled ? t('Connect') : t('Get started')}
      </span>
    </Button>
  );
};

const KeypairRadioGroup = ({
  pubKey,
  pubKeys,
  activeKey,
  onSelect,
  isReadOnly,
}: {
  pubKey: string | undefined;
  pubKeys: Key[];
  activeKey: string | undefined;
  onSelect: (pubKey: string) => void;
  isReadOnly: boolean;
}) => {
  const { data: profiles } = usePartyProfiles(
    pubKeys.map((pk) => pk.publicKey)
  );

  return (
    <DropdownMenuRadioGroup value={pubKey} onValueChange={onSelect}>
      {pubKeys.map((pk) => {
        const profile = profiles.find((p) => p.partyId === pk.publicKey);
        return (
          <KeypairItem
            key={pk.publicKey}
            pk={pk}
            isActive={activeKey === pk.publicKey}
            alias={profile?.alias}
            isReadOnly={isReadOnly}
          />
        );
      })}
    </DropdownMenuRadioGroup>
  );
};

const KeypairItem = ({
  pk,
  isActive,
  alias,
  isReadOnly,
}: {
  pk: Key;
  alias: string | undefined;
  isActive: boolean;
  isReadOnly: boolean;
}) => {
  const t = useT();
  const [copied, setCopied] = useCopyTimeout();
  const setOpen = useProfileDialogStore((store) => store.setOpen);

  return (
    <DropdownMenuRadioItem value={pk.publicKey}>
      <div>
        <div className="flex items-center gap-2">
          <span>{pk.name ? pk.name : t('Unnamed key')}</span>
          {' | '}
          <span className="font-mono">
            {truncateByChars(pk.publicKey, 3, 3)}
          </span>
          <CopyToClipboard text={pk.publicKey} onCopy={() => setCopied(true)}>
            <button
              data-testid="copy-vega-public-key"
              className="relative -top-px"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">{t('Copy')}</span>
              <VegaIcon name={VegaIconNames.COPY} />
            </button>
          </CopyToClipboard>
          {copied && <span className="text-xs">{t('Copied')}</span>}
        </div>
        <div
          className={cn('flex-1 mr-2 text-surface-0-fg-muted text-sm')}
          data-testid={`key-${pk.publicKey}`}
        >
          {!isReadOnly && (
            <Tooltip description={t('Public facing key alias. Click to edit')}>
              <button
                data-testid="alias"
                onClick={() => setOpen(pk.publicKey)}
                className="flex items-center gap-1"
              >
                {alias ? alias : t('No alias')}
                {isActive && <VegaIcon name={VegaIconNames.EDIT} />}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <DropdownMenuItemIndicator />
    </DropdownMenuRadioItem>
  );
};
