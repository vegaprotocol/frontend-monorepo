import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import {
  TradingButton as Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { truncateByChars } from '@vegaprotocol/utils';
import { type Key } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCallback, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { usePartyProfilesQuery } from '../vega-wallet-connect-button/__generated__/PartyProfiles';
import { useProfileDialogStore } from '../../stores/profile-dialog-store';

export const VegaWalletMenu = ({
  setMenu,
}: {
  setMenu: (open: 'nav' | 'wallet' | null) => void;
}) => {
  const t = useT();
  const { pubKey, pubKeys, selectPubKey, disconnect } = useVegaWallet();
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);

  const { data } = usePartyProfilesQuery({
    variables: { partyIds: pubKeys.map((pk) => pk.publicKey) },
    skip: pubKeys.length <= 0,
    fetchPolicy: 'cache-and-network',
  });

  const activeKey = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  const onSelectItem = useCallback(
    (pubkey: string) => {
      selectPubKey(pubkey);
    },
    [selectPubKey]
  );

  return (
    <div>
      <div className="grow my-4" role="list">
        {(pubKeys || []).map((pk) => {
          const profile = data?.partiesProfilesConnection?.edges.find(
            (e) => e.node.partyId === pk.publicKey
          );
          return (
            <KeypairListItem
              key={pk.publicKey}
              pk={pk}
              isActive={activeKey?.publicKey === pk.publicKey}
              onSelectItem={onSelectItem}
              alias={profile?.node.alias}
              setMenu={setMenu}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-2 m-4">
        <Button
          onClick={() => {
            setViews({ type: ViewType.Transfer }, currentRouteId);
            setMenu(null);
          }}
        >
          {t('Transfer')}
        </Button>
        <Button
          onClick={async () => {
            await disconnect();
            setMenu(null);
          }}
        >
          {t('Disconnect')}
        </Button>
      </div>
    </div>
  );
};

const KeypairListItem = ({
  pk,
  isActive,
  alias,
  onSelectItem,
  setMenu,
}: {
  pk: Key;
  isActive: boolean;
  alias: string | undefined;
  onSelectItem: (pk: string) => void;
  setMenu: (open: 'nav' | 'wallet' | null) => void;
}) => {
  const t = useT();
  const [copied, setCopied] = useCopyTimeout();
  const setOpen = useProfileDialogStore((store) => store.setOpen);

  return (
    <div
      className="flex flex-col w-full ml-4 mr-2 mb-4"
      data-testid={`key-${pk.publicKey}-mobile`}
    >
      <span className="flex gap-2 items-center mr-2">
        <button type="button" onClick={() => onSelectItem(pk.publicKey)}>
          <span className="uppercase">{pk.name}</span>
        </button>
        {isActive && <VegaIcon name={VegaIconNames.TICK} />}
      </span>
      <span className="flex gap-2 items-center">
        {truncateByChars(pk.publicKey)}{' '}
        <CopyToClipboard text={pk.publicKey} onCopy={() => setCopied(true)}>
          <button
            type="button"
            data-testid="copy-vega-public-key"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">{t('Copy')}</span>
            <VegaIcon name={VegaIconNames.COPY} />
          </button>
        </CopyToClipboard>
        {copied && <span className="text-xs">{t('Copied')}</span>}
      </span>

      <span
        className="flex gap-2 items-center"
        data-testid={`key-${pk.publicKey}`}
      >
        <button
          data-testid="alias"
          onClick={() => {
            setOpen(pk.publicKey);
            setMenu(null);
          }}
          className="flex items-center gap-1"
        >
          {alias ? alias : t('No alias')}
          <VegaIcon name={VegaIconNames.EDIT} />
        </button>
      </span>
    </div>
  );
};
