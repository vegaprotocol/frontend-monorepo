import { useTranslation } from 'react-i18next';

import { ConnectToVega } from '../../routes/staking/connect-to-vega';

export const ConnectedVegaKey = ({ pubKey }: { pubKey: string | null }) => {
  const { t } = useTranslation();
  return (
    <section>
      <strong data-testid="connected-vega-key-label">
        {pubKey ? t('Connected Vega key') : <ConnectToVega />}
      </strong>
      <p className="mb-12" data-testid="connected-vega-key">
        {pubKey}
      </p>
    </section>
  );
};
