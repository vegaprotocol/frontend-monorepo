import { t } from '@vegaprotocol/i18n';
import { LedgerManager } from '@vegaprotocol/ledger';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const LedgerContainer = () => {
  const { pubKey } = useVegaWallet();
  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return <LedgerManager partyId={pubKey} />;
};
