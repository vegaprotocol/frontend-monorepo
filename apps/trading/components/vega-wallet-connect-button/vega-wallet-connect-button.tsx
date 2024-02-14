import { useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { truncateByChars } from '@vegaprotocol/utils';
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
import { isBrowserWalletInstalled, type Key } from '@vegaprotocol/wallet';
import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';

export const VegaWalletConnectButton = ({
  intent = Intent.None,
  onClick,
}: {
  intent?: Intent;
  onClick?: () => void;
}) => {
  const t = useT();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const openVegaWalletDialog = useDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { status, pubKeys, pubKey, selectPubKey, disconnect, refreshKeys } =
    useVegaWallet();

  const walletInstalled = isBrowserWalletInstalled();

  const activeKey = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  if (status === 'connected') {
    return (
      <TradingDropdown
        open={dropdownOpen}
        trigger={
          <TradingDropdownTrigger
            data-testid="manage-vega-wallet"
            onClick={() => {
              refreshKeys();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <Button
              size="small"
              icon={<VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />}
            >
              {activeKey ? (
                <>
                  {activeKey && (
                    <span className="uppercase">{activeKey.name}</span>
                  )}
                  {' | '}
                  {truncateByChars(activeKey.publicKey)}
                </>
              ) : (
                <>{'Select key'}</>
              )}
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
              value={pubKey || undefined}
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
      onClick={() => {
        onClick?.();
        openVegaWalletDialog();
      }}
      size="small"
      intent={intent}
      icon={<VegaIcon name={VegaIconNames.ARROW_RIGHT} size={14} />}
    >
      <span className="whitespace-nowrap uppercase">
        {walletInstalled ? t('Connect') : t('Get started')}
      </span>
    </Button>
  );
};

const KeypairItem = ({ pk, active }: { pk: Key; active: boolean }) => {
  const t = useT();
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
