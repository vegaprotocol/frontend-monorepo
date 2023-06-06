import { t } from '@vegaprotocol/i18n';
import { getDateTimeFormat, truncateByChars } from '@vegaprotocol/utils';
import type { EthWithdrawalApprovalState } from './use-ethereum-withdraw-approvals-store';
import {
  ApprovalStatus,
  useEthWithdrawApprovalsStore,
  WithdrawalFailure,
} from './use-ethereum-withdraw-approvals-store';
import { useEthereumConfig } from './use-ethereum-config';
import { Button, useToasts } from '@vegaprotocol/ui-toolkit';
import { useWeb3ConnectStore } from './web3-connect-store';

export const VerificationStatus = ({
  state,
}: {
  state: EthWithdrawalApprovalState;
}) => {
  const { config } = useEthereumConfig();
  const openDialog = useWeb3ConnectStore((state) => state.open);
  const remove = useToasts((state) => state.remove);
  const deleteTx = useEthWithdrawApprovalsStore((state) => state.delete);

  if (state.status === ApprovalStatus.Error) {
    return <p>{state.message || t('Something went wrong')}</p>;
  }

  if (
    state.failureReason &&
    [
      WithdrawalFailure.WrongConnection,
      WithdrawalFailure.NoConnection,
    ].includes(state.failureReason)
  ) {
    return state.failureReason === WithdrawalFailure.NoConnection ? (
      <>
        <p>
          {t('To complete this withdrawal, connect the Ethereum wallet %s', [
            truncateByChars(state.withdrawal.details?.receiverAddress || ' '),
          ])}
        </p>
        <Button
          onClick={() => {
            openDialog();
            deleteTx(state.id);
            remove(`withdrawal-${state.id}`);
          }}
        >
          {t('Connect wallet')}
        </Button>
      </>
    ) : (
      <>
        <p>{t('Your Ethereum wallet is connected to the wrong network.')}</p>
        <p>
          {t(
            'Go to your Ethereum wallet and connect to the network (chain_id: %s)',
            [config?.chain_id || ' ']
          )}
        </p>
      </>
    );
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
