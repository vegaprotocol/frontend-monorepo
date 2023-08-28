import { t } from '@vegaprotocol/i18n';
import { LedgerExportForm } from '@vegaprotocol/ledger';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEnvironment } from '@vegaprotocol/environment';
import { useAssetsDataProvider } from '@vegaprotocol/assets';

export const LedgerContainer = () => {
  const { pubKey } = useVegaWallet();
  const VEGA_URL = useEnvironment((store) => store.VEGA_URL);
  const { data } = useAssetsDataProvider();
  const assets = (data || []).reduce((aggr, item) => {
    aggr[item.id] = item.symbol;
    return aggr;
  }, {} as Record<string, string>);
  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return (
    <LedgerExportForm partyId={pubKey} vegaUrl={VEGA_URL} assets={assets} />
  );
};
