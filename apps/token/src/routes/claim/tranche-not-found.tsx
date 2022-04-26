import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

// TODO: Provide a better message
export const TrancheNotFound = () => {
  const { t } = useTranslation();
  return (
    <Callout intent={Intent.Danger} iconName="error">
      <p>{t('Tranche not found')}</p>
    </Callout>
  );
};
