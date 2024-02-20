import { useState } from 'react';
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
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { isBrowserWalletInstalled, type Key } from '@vegaprotocol/wallet';
import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
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
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);
  const {
    status,
    pubKeys,
    pubKey,
    selectPubKey,
    disconnect,
    refreshKeys,
    isReadOnly,
  } = useVegaWallet();

  const walletInstalled = isBrowserWalletInstalled();

  const activeKey = pubKeys?.find((pk) => pk.publicKey === pubKey);

  if (status === 'connected') {
    return (
      <TradingDropdown
        open={dropdownOpen}
        trigger={
          <TradingDropdownTrigger
            data-testid="manage-vega-wallet"
            onClick={() => {
              refreshKeys();
              setDropdownOpen((x) => !x);
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
            {!isReadOnly && (
              <TradingDropdownItem
                data-testid="wallet-transfer"
                onClick={() => {
                  setViews({ type: ViewType.Transfer }, currentRouteId);
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
        className="flex flex-1 mr-2 justify-between"
        data-testid={`key-${pk.publicKey}`}
      >
        <span className="flex flex-col grow gap-px mr-2 max-w-[292px]">
          <span className="flex items-center gap-1 justify-between">
            <span>{truncateByChars(pk.publicKey)}</span>
            <CopyToClipboard text={pk.publicKey} onCopy={() => setCopied(true)}>
              <Tooltip description={t('Copied')} open={copied}>
                <button
                  data-testid="copy-vega-public-key"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">{t('Copy')}</span>
                  <VegaIcon name={VegaIconNames.COPY} />
                </button>
              </Tooltip>
            </CopyToClipboard>
          </span>

          <span className="flex items-center gap-1 justify-between">
            <span className="text-xs text-secondary text-ellipsis overflow-hidden">
              <span className="uppercase">On chain alias:</span>{' '}
              foobarsdfsldjf;laksdjf;alskdjfaksldjfsdfjadskfjdskjfksdjfksdjf
            </span>
            <button title={t('Edit alias')}>
              <span className="sr-only">{t('Edit alias')}</span>
              <VegaIcon name={VegaIconNames.EDIT} />
            </button>
          </span>
          <span className="flex gap-1 justify-between">
            <span className="text-xs text-secondary">
              <span className="uppercase">Key alias:</span>
              {pk.name}
            </span>
          </span>
        </span>
      </div>
      {/* <TradingDropdownItemIndicator /> */}
    </TradingDropdownRadioItem>
  );
};
