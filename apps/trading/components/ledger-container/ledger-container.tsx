import compact from 'lodash/compact';
import { LedgerExportForm } from '@vegaprotocol/ledger';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEnvironment } from '@vegaprotocol/environment';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { usePartyAssetsQuery } from '@vegaprotocol/assets';
import { useT } from '../../lib/use-t';

export const LedgerContainer = () => {
  const t = useT();
  const API_NODE = useEnvironment((store) => store.API_NODE);
  const { pubKey } = useVegaWallet();
  const { data, loading } = usePartyAssetsQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const assets = compact(data?.party?.accountsConnection?.edges ?? [])
    .map((item) => item?.node?.asset)
    .reduce(
      (aggr, item) => Object.assign(aggr, { [item.id]: item }),
      {} as Record<string, AssetFieldsFragment>
    );

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  if (!API_NODE) {
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
    <LedgerExportForm
      partyId={pubKey}
      vegaUrl={API_NODE.graphQLApiUrl}
      assets={assets}
    />
  );
};
