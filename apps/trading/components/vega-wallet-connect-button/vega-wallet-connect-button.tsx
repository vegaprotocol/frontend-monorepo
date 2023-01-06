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
} from '@vegaprotocol/ui-toolkit';
import type { PubKey } from '@vegaprotocol/wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

const MobileWalletButton = ({ isConnected }: { isConnected?: boolean }) => {
  const { pubKeys, disconnect } = useVegaWallet();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    if (isConnected) {
      setDrawerOpen(!drawerOpen);
    } else {
      openVegaWalletDialog();
      setDrawerOpen(false);
    }
  }, [drawerOpen, isConnected, openVegaWalletDialog]);

  return (
    <div className="md:hidden overflow-hidden flex">
      <button
        className="my-2 transition-all flex flex-col justify-around gap-3 p-2 relative z-20 h-[34px]"
        onClick={openDrawer}
      >
        <svg
          width="26"
          height="18"
          viewBox="0 0 26 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={classNames({ hidden: drawerOpen })}
        >
          <path
            d="M4.77437 17.7499H4.74987C3.6504 17.7368 2.77439 16.8489 2.77439 15.7772V12.8495V12.6343L2.5615 12.6023C1.59672 12.4575 0.849609 11.6116 0.849609 10.6266V7.40064C0.849609 6.39018 1.59509 5.56985 2.56147 5.4249L2.77439 5.39297V5.17767V2.24998C2.77439 1.14102 3.66537 0.25 4.77437 0.25H23.7501C24.8591 0.25 25.7501 1.14098 25.7501 2.24998V15.7499C25.7501 16.8588 24.8591 17.7499 23.7501 17.7499H4.77437ZM4.44917 12.5992H4.19917L4.77441 16.075V16.325H4.77466H23.7502C24.0778 16.325 24.3254 16.0777 24.3254 15.7497V2.24984C24.3254 1.9222 24.0782 1.6746 23.7502 1.6746H4.77441C4.44677 1.6746 4.19917 1.92182 4.19917 2.24984V5.12306V5.37306H4.44917H7.0244C8.51139 5.37306 9.67508 6.56094 9.67508 8.02374V9.94852C9.67508 11.4355 8.4872 12.5992 7.0244 12.5992H4.44917ZM2.84963 6.8253C2.52199 6.8253 2.27439 7.07253 2.27439 7.40054V10.6264C2.27439 10.9541 2.52161 11.2017 2.84962 11.2017L7.02419 11.2019C7.73619 11.2019 8.25009 10.6515 8.25009 9.97598V8.0512C8.25009 7.3392 7.69976 6.8253 7.0242 6.8253H2.84963Z"
            fill="white"
            stroke="none"
          />
        </svg>
        <>
          <div
            className={classNames('w-[26px] h-[1px] bg-white transition-all', {
              hidden: !drawerOpen,
              'translate-y-[7.5px] rotate-45': drawerOpen,
            })}
          />
          <div
            className={classNames('w-[26px] h-[1px] bg-white transition-all', {
              hidden: !drawerOpen,
              '-translate-y-[7.5px] -rotate-45': drawerOpen,
            })}
          />
        </>
      </button>
      <div
        className={classNames(
          'h-full max-w-[500px] -right-[90%] z-10 top-0 fixed w-[90vw] transition-all',
          {
            'right-0': drawerOpen,
          }
        )}
      >
        <div className="border-l border-default p-2 gap-4 flex flex-col w-full h-full bg-white dark:bg-black dark:text-white justify-between">
          <div className="flex h-5"></div>
          <div className="grow" role="list">
            {(pubKeys || []).map((pk) => (
              <KeypairListItem key={pk.publicKey} pk={pk} />
            ))}
          </div>
          <div className="m-4">
            <Button className="" onClick={disconnect} fill>
              {t('Disconnect')}
            </Button>
          </div>
        </div>
      </div>
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
        <MobileWalletButton isConnected />
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

const KeypairListItem = ({ pk }: { pk: PubKey }) => {
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
        <span className="uppercase">{pk.name}</span>
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
