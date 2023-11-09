import { LedgerExportForm } from '@vegaprotocol/ledger';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEnvironment } from '@vegaprotocol/environment';
import type { PartyAssetFieldsFragment } from '@vegaprotocol/assets';
import { usePartyAssetsQuery } from '@vegaprotocol/assets';
import { useT } from '../../lib/use-t';

export const LedgerContainer = () => {
  const t = useT();
  const VEGA_URL = useEnvironment((store) => store.VEGA_URL);
  const { pubKey } = useVegaWallet();
  const { data, loading } = usePartyAssetsQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const assets = (data?.party?.accountsConnection?.edges ?? [])
    .map<PartyAssetFieldsFragment>(
      (item) => item?.node?.asset ?? ({} as PartyAssetFieldsFragment)
    )
    .reduce((aggr, item) => {
      if ('id' in item && 'symbol' in item) {
        aggr[item.id as string] = item.symbol as string;
      }
      return aggr;
    }, {} as Record<string, string>);

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  if (!VEGA_URL) {
    return (
      <Splash>
        <p>{t('Environment not configured')}</p>
      </Splash>
    );
  }

  if (loading) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!Object.keys(assets).length) {
    return (
      <Splash>
        <p>{t('No ledger entries to export')}</p>
      </Splash>
    );
  }

  return (
    <LedgerExportForm partyId={pubKey} vegaUrl={VEGA_URL} assets={assets} />
  );
};
