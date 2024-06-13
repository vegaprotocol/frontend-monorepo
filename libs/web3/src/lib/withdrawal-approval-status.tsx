import { getDateTimeFormat, truncateByChars } from '@vegaprotocol/utils';
import type { EthWithdrawalApprovalState } from './use-ethereum-withdraw-approvals-store';
import {
  ApprovalStatus,
  useEthWithdrawApprovalsStore,
  WithdrawalFailure,
} from './use-ethereum-withdraw-approvals-store';
import { Button, useToasts } from '@vegaprotocol/ui-toolkit';
import { useWeb3ConnectStore } from './web3-connect-store';
import { useT } from './use-t';
import { toAssetData } from './types';
import { getExternalChainLabel } from '@vegaprotocol/environment';

export const VerificationStatus = ({
  state,
}: {
  state: EthWithdrawalApprovalState;
}) => {
  const t = useT();

  const openDialog = useWeb3ConnectStore((state) => state.open);
  const remove = useToasts((state) => state.remove);
  const deleteTx = useEthWithdrawApprovalsStore((state) => state.delete);

  const assetData = toAssetData(state.withdrawal.asset);

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
          {t(
            'To complete this withdrawal, connect the Ethereum wallet {{receiverAddress}}',
            {
              receiverAddress: truncateByChars(
                state.withdrawal.details?.receiverAddress || ' '
              ),
            }
          )}
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
        {assetData && (
          <p className="mt-2">
            {t('Go to your wallet and connect to the network {{networkName}}', {
              networkName: getExternalChainLabel(assetData.chainId.toString()),
            })}
          </p>
        )}
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
        <p>
          {t(`Cannot be completed until {{time}}`, { time: formattedTime })}
        </p>
      </>
    );
  }

  if (state.status === ApprovalStatus.Ready) {
    return <p>{t('The withdrawal has been approved.')}</p>;
  }

  return null;
};
