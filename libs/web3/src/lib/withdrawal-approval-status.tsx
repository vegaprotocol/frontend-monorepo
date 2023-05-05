import { t } from '@vegaprotocol/i18n';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import type { EthWithdrawalApprovalState } from './use-ethereum-withdraw-approvals-store';
import { ApprovalStatus } from './use-ethereum-withdraw-approvals-store';

export const VerificationStatus = ({
  state,
}: {
  state: EthWithdrawalApprovalState;
}) => {
  if (state.status === ApprovalStatus.Error) {
    return <p>{state.message || t('Something went wrong')}</p>;
  }

  if (state.status === ApprovalStatus.Pending) {
    return <p>{t('Verifying...')}</p>;
  }

  if (state.status === ApprovalStatus.Delayed && state.completeTimestamp) {
    const formattedTime = getDateTimeFormat().format(
      new Date(state.completeTimestamp)
    );
    return (
      <>
        <p>{t("The amount you're withdrawing has triggered a time delay")}</p>
        <p>{t(`Cannot be completed until ${formattedTime}`)}</p>
      </>
    );
  }

  if (state.status === ApprovalStatus.Ready) {
    return <p>{t('The withdrawal has been approved.')}</p>;
  }

  return null;
};
