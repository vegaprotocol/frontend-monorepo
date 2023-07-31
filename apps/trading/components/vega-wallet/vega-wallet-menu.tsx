import { t } from '@vegaprotocol/i18n';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import {
  TradingButton as Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { truncateByChars } from '@vegaprotocol/utils';
import { useVegaWallet, type PubKey } from '@vegaprotocol/wallet';
import { useCallback, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ViewType, useSidebar } from '../sidebar';

export const VegaWalletMenu = ({
  setMenu,
}: {
  setMenu: (open: 'nav' | 'wallet' | null) => void;
}) => {
  const { pubKey, pubKeys, selectPubKey, disconnect } = useVegaWallet();
  const setView = useSidebar((store) => store.setView);

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
            setView({ type: ViewType.Transfer });
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
    </div>
  );
};
