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
  TradingDropdownItemIndicator,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { isBrowserWalletInstalled, type Key } from '@vegaprotocol/wallet';
import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { usePartyProfilesQuery } from './__generated__/PartyProfiles';
import { useProfileDialogStore } from '../../stores/profile-dialog-store';

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
                    <span className="uppercase">
                      {activeKey.name ? activeKey.name : t('Unnamed key')}
                    </span>
                  )}
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
            <KeypairRadioGroup
              pubKey={pubKey}
              pubKeys={pubKeys}
              onSelect={selectPubKey}
            />
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

const KeypairRadioGroup = ({
  pubKey,
  pubKeys,
  onSelect,
}: {
  pubKey: string | undefined;
  pubKeys: Key[];
  onSelect: (pubKey: string) => void;
}) => {
  const { data } = usePartyProfilesQuery({
    variables: { partyIds: pubKeys.map((pk) => pk.publicKey) },
    skip: pubKeys.length <= 0,
    fetchPolicy: 'cache-and-network',
  });

  return (
    <TradingDropdownRadioGroup value={pubKey} onValueChange={onSelect}>
      {pubKeys.map((pk) => {
        const profile = data?.partiesProfilesConnection?.edges.find(
          (e) => e.node.partyId === pk.publicKey
        );
        return (
          <KeypairItem key={pk.publicKey} pk={pk} alias={profile?.node.alias} />
        );
      })}
    </TradingDropdownRadioGroup>
  );
};

const KeypairItem = ({ pk, alias }: { pk: Key; alias: string | undefined }) => {
  const t = useT();
  const [copied, setCopied] = useCopyTimeout();
  const setOpen = useProfileDialogStore((store) => store.setOpen);

  return (
    <TradingDropdownRadioItem value={pk.publicKey}>
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
          className={classNames('flex-1 mr-2 text-secondary text-sm')}
          data-testid={`key-${pk.publicKey}`}
        >
          <Tooltip description={t('Public facing key alias. Click to edit')}>
            <button
              data-testid="alias"
              onClick={() => setOpen(pk.publicKey)}
              className="flex items-center gap-1"
            >
              {alias ? alias : t('No alias')}
              <VegaIcon name={VegaIconNames.EDIT} />
            </button>
          </Tooltip>
        </div>
      </div>
      <TradingDropdownItemIndicator />
    </TradingDropdownRadioItem>
  );
};
