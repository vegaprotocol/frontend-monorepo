import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

interface StakeFailureProps {
  nodeName: string;
}

export const StakeFailure = ({ nodeName }: StakeFailureProps) => {
  const { t } = useTranslation();
  return (
    <Dialog
      intent={Intent.Danger}
      title={t('Something went wrong')}
      open={true}
    >
      <p>
        {t('stakeFailed', {
          node: nodeName,
        })}
      </p>
    </Dialog>
  );
};
