import { useCallback, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';
import { truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Drawer,
  DropdownMenuSeparator,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { PubKey } from '@vegaprotocol/wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { WalletIcon } from '../icons/wallet';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import { useSidebar } from '../sidebar';

const MobileWalletButton = ({
  isConnected,
  activeKey,
}: {
  isConnected?: boolean;
  activeKey?: PubKey;
}) => {
  const { pubKeys, selectPubKey, disconnect, fetchPubKeys } = useVegaWallet();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { VEGA_ENV } = useEnvironment();
  const isYellow = VEGA_ENV === Networks.TESTNET;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mobileDisconnect = useCallback(() => {
    setDrawerOpen(false);
    disconnect();
  }, [disconnect]);
  const openDrawer = useCallback(() => {
    if (!isConnected) {
      openVegaWalletDialog();
      setDrawerOpen(false);
    } else {
      if (fetchPubKeys) {
        fetchPubKeys();
      }
      setDrawerOpen(!drawerOpen);
    }
  }, [drawerOpen, fetchPubKeys, isConnected, openVegaWalletDialog]);

  const iconClass = drawerOpen
    ? 'hidden'
    : isYellow
    ? 'fill-black'
    : 'fill-white';
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const walletButton = (
    <button
      className="my-2 transition-all flex flex-col justify-around gap-3 p-2 relative h-[34px]"
      onClick={openDrawer}
      data-testid="connect-vega-wallet-mobile"
    >
      <WalletIcon className={iconClass} />
    </button>
  );
  const onSelectItem = useCallback(
    (pubkey: string) => {
      setDrawerOpen(false);
      selectPubKey(pubkey);
    },
    [selectPubKey]
  );
  return (
    <div className="lg:hidden overflow-hidden flex" ref={setContainer}>
      <Drawer
        dataTestId="wallets-drawer"
        open={drawerOpen}
        onChange={setDrawerOpen}
        container={container}
        trigger={walletButton}
      >
        <div className="border-l border-default p-2 gap-4 flex flex-col w-full h-full bg-white dark:bg-black dark:text-white justify-between">
          <div className="flex h-5 justify-end">
            <button
              className="transition-all flex flex-col justify-around gap-3 p-2 relative h-[34px]"
              onClick={() => setDrawerOpen(false)}
              data-testid="connect-vega-wallet-mobile-close"
            >
              <>
                <div
                  className={classNames(
                    'w-[26px] h-[2px] bg-black dark:bg-white transition-all translate-y-[7.5px] rotate-45',
                    {
                      hidden: !drawerOpen,
                    }
                  )}
                />
                <div
                  className={classNames(
                    'w-[26px] h-[2px] bg-black dark:bg-white transition-all -translate-y-[7.5px] -rotate-45',
                    {
                      hidden: !drawerOpen,
                    }
                  )}
                />
              </>
            </button>
          </div>
          <div className="grow my-4" role="list">
            {(pubKeys || []).map((pk) => (
              <KeypairListItem
                key={pk.publicKey}
                pk={pk}
                isActive={activeKey?.publicKey === pk.publicKey}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 m-4">
            <Button
              onClick={() => {
                setDrawerOpen(false);
                // openTransferDialog(true);
                alert('TODO: handle transfer on mobile');
              }}
              fill
            >
              {t('Transfer')}
            </Button>
            <Button onClick={mobileDisconnect} fill>
              {t('Disconnect')}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export const VegaWalletConnectButton = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { setView } = useSidebar();
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
      <>
        <div className="hidden lg:block">
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
                {activeKey && (
                  <span className="uppercase">{activeKey.name}</span>
                )}
                {': '}
                {truncateByChars(pubKey)}
              </DropdownMenuTrigger>
            }
          >
            <DropdownMenuContent
              onInteractOutside={() => setDropdownOpen(false)}
              sideOffset={20}
              side="bottom"
              align="end"
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
                    onClick={() => setView('transfer')}
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
        </div>
        <MobileWalletButton isConnected activeKey={activeKey} />
      </>
    );
  }

  return (
    <>
      <Button
        data-testid="connect-vega-wallet"
        onClick={openVegaWalletDialog}
        size="sm"
        className="hidden lg:block"
      >
        <span className="whitespace-nowrap">{t('Connect Vega wallet')}</span>
      </Button>
      <MobileWalletButton />
    </>
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

const KeypairListItem = ({
  pk,
  isActive,
  onSelectItem,
}: {
  pk: PubKey;
  isActive: boolean;
  onSelectItem: (pk: string) => void;
}) => {
  const [copied, setCopied] = useCopyTimeout();

  return (
    <div
      className="flex flex-col w-full ml-4 mr-2 mb-4"
      data-testid={`key-${pk.publicKey}-mobile`}
    >
      <span className="flex gap-2 items-center mr-2">
        <button onClick={() => onSelectItem(pk.publicKey)}>
          <span className="uppercase">{pk.name}</span>
        </button>
        {isActive && <VegaIcon name={VegaIconNames.TICK} />}
      </span>
      <span className="flex gap-2 items-center">
        {truncateByChars(pk.publicKey)}{' '}
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
  );
};
