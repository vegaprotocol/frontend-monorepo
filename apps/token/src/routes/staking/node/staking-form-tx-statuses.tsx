import { StakeFailure } from './stake-failure';
import { StakeRequested } from './stake-requested';
import { StakePending } from './stake-pending';
import { StakeSuccess } from './stake-success';
import { FormState } from './staking-form';
import type { RemoveType, StakeAction } from './staking-form';

interface StakeFormTxStatusesProps {
  formState: FormState;
  nodeName: string;
  amount: string;
  action: StakeAction;
  removeType: RemoveType;
  isDialogVisible: boolean;
  toggleDialog: () => void;
  error: Error | null;
}

export const StakingFormTxStatuses = ({
  formState,
  nodeName,
  amount,
  action,
  removeType,
  isDialogVisible,
  toggleDialog,
  error,
}: StakeFormTxStatusesProps) => {
  switch (formState) {
    case FormState.Requested:
      return (
        <StakeRequested
          isDialogVisible={isDialogVisible}
          toggleDialog={toggleDialog}
        />
      );
    case FormState.Pending:
      return (
        <StakePending
          action={action}
          amount={amount}
          nodeName={nodeName}
          isDialogVisible={isDialogVisible}
          toggleDialog={toggleDialog}
        />
      );
    case FormState.Success:
      return (
        <StakeSuccess
          action={action}
          amount={amount}
          nodeName={nodeName}
          isDialogVisible={isDialogVisible}
          toggleDialog={toggleDialog}
          removeType={removeType}
        />
      );
    case FormState.Failure:
      return (
        <StakeFailure
          nodeName={nodeName}
          isDialogVisible={isDialogVisible}
          toggleDialog={toggleDialog}
          error={error}
        />
      );
    default:
      return null;
  }
};
