import { useCallback, useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';
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
  Drawer,
} from '@vegaprotocol/ui-toolkit';
import type { PubKey } from '@vegaprotocol/wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { WalletIcon } from '../icons/wallet';

const MobileWalletButton = ({
  isConnected,
  activeKey,
}: {
  isConnected?: boolean;
  activeKey?: PubKey;
}) => {
  const { pubKeys, selectPubKey, disconnect } = useVegaWallet();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { VEGA_ENV } = useEnvironment();
  const isYellow = VEGA_ENV === Networks.TESTNET && false;
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
      setDrawerOpen(!drawerOpen);
    }
  }, [drawerOpen, isConnected, openVegaWalletDialog]);

  const iconClass = drawerOpen
    ? 'hidden'
    : isYellow
    ? 'fill-black'
    : 'fill-white';
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const walletButton = (
    <button
      className={classNames(
        'my-2 transition-all flex flex-col justify-around gap-3 p-2 relative h-[34px]',
        drawerOpen ? 'z-50' : 'z-20'
      )}
      onClick={openDrawer}
      data-testid="connect-vega-wallet-mobile"
    >
      <WalletIcon className={iconClass} />
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
  );
  const onSelectItem = useCallback(
    (pubkey: string) => {
      setDrawerOpen(false);
      selectPubKey(pubkey);
    },
    [selectPubKey]
  );
  return (
    <div className="md:hidden overflow-hidden flex" ref={setContainer}>
      <Drawer
        data-testid="wallets-drawer"
        open={drawerOpen}
        onChange={setDrawerOpen}
        container={container}
        trigger={walletButton}
      >
        <div className="border-l border-default p-2 gap-4 flex flex-col w-full h-full bg-white dark:bg-black dark:text-white justify-between">
          <div className="flex h-5"></div>
          <div className="grow" role="list">
            {(pubKeys || []).map((pk) => (
              <KeypairListItem
                key={pk.publicKey}
                pk={pk}
                isActive={activeKey?.publicKey === pk.publicKey}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
          <div className="m-4">
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
  const { pubKey, pubKeys, selectPubKey, disconnect } = useVegaWallet();
  const isConnected = pubKey !== null;

  const activeKey = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  if (isConnected && pubKeys) {
    return (
      <>
        <div className="hidden md:block">
          <DropdownMenu open={dropdownOpen}>
            <DropdownMenuTrigger
              data-testid="manage-vega-wallet"
              onClick={() => setDropdownOpen((curr) => !curr)}
            >
              {activeKey && <span className="uppercase">{activeKey.name}</span>}
              {': '}
              {truncateByChars(pubKey)}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onInteractOutside={() => setDropdownOpen(false)}
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
        className="hidden md:block"
      >
        <span className="whitespace-nowrap">{t('Connect Vega wallet')}</span>
      </Button>
      <MobileWalletButton />
    </>
  );
};

const KeypairItem = ({ pk }: { pk: PubKey }) => {
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
    <DropdownMenuRadioItem value={pk.publicKey}>
      <div className="flex-1 mr-2" data-testid={`key-${pk.publicKey}`}>
        <span className="mr-2">
          <span>
            <span className="uppercase">{pk.name}</span>:{' '}
            {truncateByChars(pk.publicKey)}
          </span>
        </span>
        <span>
          <CopyToClipboard text={pk.publicKey} onCopy={() => setCopied(true)}>
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

const KeypairListItem = ({
  pk,
  isActive,
  onSelectItem,
}: {
  pk: PubKey;
  isActive: boolean;
  onSelectItem: (pk: string) => void;
}) => {
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
    <div
      className="flex flex-col w-full ml-4 mr-2 mb-4"
      data-testid={`key-${pk.publicKey}`}
    >
      <span className="mr-2">
        <button onClick={() => onSelectItem(pk.publicKey)}>
          <span className="uppercase">{pk.name}</span>
        </button>
        {isActive && <Icon name="tick" className="ml-2" />}
      </span>
      <span className="text-neutral-500 dark:text-neutral-400">
        {truncateByChars(pk.publicKey)}{' '}
        <CopyToClipboard text={pk.publicKey} onCopy={() => setCopied(true)}>
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
  );
};
