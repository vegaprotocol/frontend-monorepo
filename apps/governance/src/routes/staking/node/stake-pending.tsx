import { Dialog, Loader } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Actions } from './staking-form';
import type { StakeAction } from './staking-form';

interface StakePendingProps {
  action: StakeAction;
  amount: string;
  nodeName: string;
  isDialogVisible: boolean;
  toggleDialog: () => void;
}

export const StakePending = ({
  action,
  amount,
  nodeName,
  isDialogVisible,
  toggleDialog,
}: StakePendingProps) => {
  const { t } = useTranslation();
  const titleArgs = { amount, node: nodeName };
  const isAdd = action === Actions.Add;
  const title = isAdd
    ? t('stakeAddPendingTitle', titleArgs)
    : t('stakeRemovePendingTitle', titleArgs);

  return (
    <Dialog
      icon={<Loader size="small" />}
      title={title}
      open={isDialogVisible}
      onChange={toggleDialog}
    >
      <p>{t('timeForConfirmation')}</p>
    </Dialog>
  );
};
