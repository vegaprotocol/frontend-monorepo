import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

interface StakeFailureProps {
  nodeName: string;
}

export const StakeFailure = ({ nodeName }: StakeFailureProps) => {
  const { t } = useTranslation();
  return (
    <Callout intent={Intent.Danger} title={t('Something went wrong')}>
      <p>
        {t('stakeFailed', {
          node: nodeName,
        })}
      </p>
    </Callout>
  );
};
