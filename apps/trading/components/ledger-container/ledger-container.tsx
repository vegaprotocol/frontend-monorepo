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
    .map((item) => item?.node?.asset)
    .filter((asset): asset is PartyAssetFieldsFragment => !!asset?.id)
    .reduce(
      (aggr, item) => Object.assign(aggr, { [item.id]: item.symbol }),
      {} as Record<string, string>
    );

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
