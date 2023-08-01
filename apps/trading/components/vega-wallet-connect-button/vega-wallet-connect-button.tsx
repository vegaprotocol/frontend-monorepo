import { useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isBrowserWalletInstalled, truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  VegaIcon,
  VegaIconNames,
  TradingButton as Button,
  Intent,
  TradingDropdown,
  TradingDropdownTrigger,
  TradingDropdownContent,
  TradingDropdownRadioGroup,
  TradingDropdownSeparator,
  TradingDropdownItem,
  TradingDropdownRadioItem,
  TradingDropdownItemIndicator,
} from '@vegaprotocol/ui-toolkit';
import type { PubKey } from '@vegaprotocol/wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import { ViewType, useSidebar } from '../sidebar';
import classNames from 'classnames';

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
  const walletInstalled = isBrowserWalletInstalled();
  const activeKey = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  if (isConnected && pubKeys) {
    return (
      <TradingDropdown
        open={dropdownOpen}
        trigger={
          <TradingDropdownTrigger
            data-testid="manage-vega-wallet"
            onClick={() => {
              if (fetchPubKeys) {
                fetchPubKeys();
              }
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <Button
              size="small"
              icon={<VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />}
            >
              {activeKey && <span className="uppercase">{activeKey.name}</span>}
              {' | '}
              {truncateByChars(pubKey)}
            </Button>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent
          onInteractOutside={() => setDropdownOpen(false)}
          sideOffset={12}
          side="bottom"
          align="end"
          onEscapeKeyDown={() => setDropdownOpen(false)}
        >
          <div className="min-w-[340px]" data-testid="keypair-list">
            <TradingDropdownRadioGroup
              value={pubKey}
              onValueChange={(value) => {
                selectPubKey(value);
              }}
            >
              {pubKeys.map((pk) => (
                <KeypairItem
                  key={pk.publicKey}
                  pk={pk}
                  active={pk.publicKey === pubKey}
                />
              ))}
            </TradingDropdownRadioGroup>
            <TradingDropdownSeparator />
            {!isReadOnly && (
              <TradingDropdownItem
                data-testid="wallet-transfer"
                onClick={() => {
                  setView({ type: ViewType.Transfer });
                  setDropdownOpen(false);
                }}
              >
                {t('Transfer')}
              </TradingDropdownItem>
            )}
            <TradingDropdownItem data-testid="disconnect" onClick={disconnect}>
              {t('Disconnect')}
            </TradingDropdownItem>
          </div>
        </TradingDropdownContent>
      </TradingDropdown>
    );
  }

  return (
    <Button
      data-testid="connect-vega-wallet"
      onClick={openVegaWalletDialog}
      size="small"
      intent={Intent.None}
      icon={<VegaIcon name={VegaIconNames.ARROW_RIGHT} size={14} />}
    >
      <span className="whitespace-nowrap uppercase">
        {walletInstalled ? t('Connect') : t('Get started')}
      </span>
    </Button>
  );
};

const KeypairItem = ({ pk, active }: { pk: PubKey; active: boolean }) => {
  const [copied, setCopied] = useCopyTimeout();

  return (
    <TradingDropdownRadioItem value={pk.publicKey}>
      <div
        className={classNames('flex-1 mr-2', {
          'text-default': active,
          'text-muted': !active,
        })}
        data-testid={`key-${pk.publicKey}`}
      >
        <span className={classNames('mr-2 uppercase')}>
          {pk.name}
          {' | '}
          {truncateByChars(pk.publicKey)}
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
      <TradingDropdownItemIndicator />
    </TradingDropdownRadioItem>
  );
};
