import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

export const TransactionRequested = () => {
  const { t } = useTranslation();
  return (
    <Callout
      iconName="hand-up"
      intent={Intent.Warning}
      title={t('Awaiting action in Ethereum wallet (e.g. metamask)')}
    />
  );
};
