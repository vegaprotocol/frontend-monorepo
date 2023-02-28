import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

interface StakeFailureProps {
  nodeName: string;
  isDialogVisible: boolean;
  toggleDialog: () => void;
  error: Error | null;
}

export const StakeFailure = ({
  nodeName,
  isDialogVisible,
  toggleDialog,
  error,
}: StakeFailureProps) => {
  const { t } = useTranslation();
  return (
    <Dialog
      intent={Intent.Danger}
      title={t('Something went wrong')}
      open={isDialogVisible}
      onChange={toggleDialog}
    >
      {error ? (
        <p>{error.message}</p>
      ) : (
        <p>
          {t('stakeFailed', {
            node: nodeName,
          })}
        </p>
      )}
    </Dialog>
  );
};
