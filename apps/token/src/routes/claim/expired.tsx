import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

export const Expired = ({ code }: { code: string }) => {
  const { t } = useTranslation();
  return (
    <Callout intent={Intent.Danger} iconName="error" title={t('codeExpired')}>
      <p>
        {t(
          'This code ({code}) has expired and cannot be used to claim tokens',
          { code }
        )}
      </p>
    </Callout>
  );
};
