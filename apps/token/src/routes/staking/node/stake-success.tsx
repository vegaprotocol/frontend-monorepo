import { Dialog, Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import type { StakeAction } from './staking-form';
import { Actions, RemoveType } from './staking-form';

interface StakeSuccessProps {
  action: StakeAction;
  amount: string;
  nodeName: string;
  removeType: RemoveType;
  isDialogVisible: boolean;
  toggleDialog: () => void;
}

export const StakeSuccess = ({
  action,
  amount,
  nodeName,
  removeType,
  isDialogVisible,
  toggleDialog,
}: StakeSuccessProps) => {
  const { t } = useTranslation();
  const isAdd = action === Actions.Add;
  const title = isAdd
    ? t('stakeAddSuccessTitle', { amount })
    : t('stakeRemoveSuccessTitle', { amount, node: nodeName });
  const message = isAdd
    ? t('stakeAddSuccessMessage')
    : removeType === RemoveType.EndOfEpoch
    ? t('stakeRemoveSuccessMessage')
    : t('stakeRemoveNowSuccessMessage');

  return (
    <Dialog
      icon={<Icon name="tick" />}
      intent={Intent.Success}
      title={title}
      open={isDialogVisible}
      onChange={toggleDialog}
    >
      <div>
        <p>{message}</p>
      </div>
    </Dialog>
  );
};
