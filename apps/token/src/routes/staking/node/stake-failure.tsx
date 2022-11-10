import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

interface StakeFailureProps {
  nodeName: string;
  isDialogVisible: boolean;
  toggleDialog: () => void;
}

export const StakeFailure = ({
  nodeName,
  isDialogVisible,
  toggleDialog,
}: StakeFailureProps) => {
  const { t } = useTranslation();
  return (
    <Dialog
      intent={Intent.Danger}
      title={t('Something went wrong')}
      open={isDialogVisible}
      onChange={toggleDialog}
    >
      <p>
        {t('stakeFailed', {
          node: nodeName,
        })}
      </p>
    </Dialog>
  );
};
