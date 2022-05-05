import { gql, useQuery } from '@apollo/client';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { format } from 'date-fns';
import orderBy from 'lodash/orderBy';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../components/heading';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { useRefreshBalances } from '../../hooks/use-refresh-balances';
import { BigNumber } from '../../lib/bignumber';
import { DATE_FORMAT_DETAILED } from '../../lib/date-formats';
import { addDecimal } from '../../lib/decimals';
import { truncateMiddle } from '../../lib/truncate-middle';
import type {
  WithdrawalsPage,
  WithdrawalsPage_party_withdrawals,
  WithdrawalsPageVariables,
} from './__generated__/WithdrawalsPage';
import { useCompleteWithdraw } from '@vegaprotocol/withdraws';
import { TransactionDialog } from '@vegaprotocol/web3';

const Withdrawals = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('withdrawalsTitle')} />
      <VegaWalletContainer>
        {(currVegaKey) => (
          <WithdrawPendingContainer currVegaKey={currVegaKey} />
        )}
      </VegaWalletContainer>
    </>
  );
};

interface WithdrawPendingContainerProps {
  currVegaKey: VegaKeyExtended;
}

const WITHDRAWALS_PAGE_QUERY = gql`
  query WithdrawalsPage($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawals {
        id
        amount
        asset {
          id
          symbol
          decimals
        }
        party {
          id
        }
        status
        createdTimestamp
        withdrawnTimestamp
        txHash
        details {
          ... on Erc20WithdrawalDetails {
            receiverAddress
          }
        }
      }
    }
  }
`;

const WithdrawPendingContainer = ({
  currVegaKey,
}: WithdrawPendingContainerProps) => {
  const { t } = useTranslation();
  // const { account } = useWeb3React();
  const { transaction, submit } = useCompleteWithdraw();
  // const refreshBalances = useRefreshBalances(account || '');
  const { data, loading, error } = useQuery<
    WithdrawalsPage,
    WithdrawalsPageVariables
  >(WITHDRAWALS_PAGE_QUERY, {
    variables: { partyId: currVegaKey.pub },
  });

  const withdrawals = React.useMemo(() => {
    if (!data?.party?.withdrawals?.length) return [];

    return orderBy(
      data.party.withdrawals,
      [(w) => new Date(w.createdTimestamp)],
      ['desc']
    );
  }, [data]);

  if (error) {
    return (
      <section>
        <p>{t('Something went wrong')}</p>
        {error && <pre>{error.message}</pre>}
      </section>
    );
  }

  if (loading || !data) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  if (!withdrawals.length) {
    return <p>{t('withdrawalsNone')}</p>;
  }

  return (
    <>
      <h2>{t('withdrawalsPreparedWarningHeading')}</h2>
      <p>{t('withdrawalsText')}</p>
      <p>{t('withdrawalsPreparedWarningText')}</p>
      <ul role="list">
        {withdrawals.map((w) => (
          <li key={w.id}>
            <Withdrawal
              withdrawal={w}
              // refetchWithdrawals={refetch}
              // refetchBalances={refreshBalances}
              complete={submit}
            />
          </li>
        ))}
      </ul>
      <TransactionDialog name="withdraw" {...transaction} />
    </>
  );
};

interface WithdrawalProps {
  withdrawal: WithdrawalsPage_party_withdrawals;
  complete: (withdrawalId: string) => void;
}

export const Withdrawal = ({ withdrawal, complete }: WithdrawalProps) => {
  const { t } = useTranslation();
  // const erc20Approval = usePollERC20Approval(withdrawal.id);
  // const { erc20Bridge } = useContracts();
  // const { state, perform, reset } = useTransaction(() => {
  //   if (!erc20Approval) {
  //     throw new Error('Withdraw needs approval object');
  //   }
  //   if (!withdrawal.details?.receiverAddress) {
  //     throw new Error('Missing receiver address');
  //   }

  //   return erc20Bridge.withdraw({
  //     assetSource: erc20Approval.assetSource,
  //     amount: erc20Approval.amount,
  //     nonce: erc20Approval.nonce,
  //     signatures: erc20Approval.signatures,
  //     // TODO: switch when targetAddress is populated and deployed to mainnet data.erc20WithdrawalApproval.targetAddress,
  //     targetAddress: withdrawal.details.receiverAddress,
  //   });
  // });

  // React.useEffect(() => {
  //   // Once complete we need to refetch the withdrawals so that pending withdrawal
  //   // is updated to have a txHash indicating it is complete. Updating your account balance
  //   // is already handled by the query in the VegaWallet that polls
  //   if (state.txState === TxState.Complete) {
  //     refetchWithdrawals();
  //     refetchBalances();
  //   }
  // }, [state, refetchWithdrawals, refetchBalances]);

  return (
    <div>
      <KeyValueTable>
        <KeyValueTableRow>
          {t('Withdraw')}
          <span>
            {addDecimal(
              new BigNumber(withdrawal.amount),
              withdrawal.asset.decimals
            )}{' '}
            {withdrawal.asset.symbol}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('from')}
          <span>{truncateMiddle(withdrawal.party.id)}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('toEthereum')}
          <span>
            <EtherscanLink
              address={withdrawal.details?.receiverAddress as string}
              text={truncateMiddle(
                withdrawal.details?.receiverAddress as string
              )}
            />
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('created')}
          <span>
            {format(
              new Date(withdrawal.createdTimestamp),
              DATE_FORMAT_DETAILED
            )}
          </span>
        </KeyValueTableRow>
        {/* <KeyValueTableRow>
          {t('Signature')}
          <span title={erc20Approval?.signatures}>
            {!erc20Approval?.signatures
              ? t('Loading')
              : truncateMiddle(erc20Approval.signatures)}
          </span>
        </KeyValueTableRow> */}
      </KeyValueTable>
      <div>
        {withdrawal.txHash ? (
          <>
            {t('Finalized')}
            <EtherscanLink
              tx={withdrawal.txHash}
              text={t('View on Etherscan (opens in a new tab)')}
            />
          </>
        ) : (
          <>
            {t('Open')}
            <button
              className="underline"
              onClick={() => complete(withdrawal.id)}
            >
              {t('Complete')}
            </button>
          </>
        )}
      </div>
      {/* <TransactionButton
        text={
          !erc20Approval
            ? t('withdrawalsPreparingButton')
            : t('withdrawalsCompleteButton')
        }
        transactionState={state}
        forceTxState={withdrawal.txHash ? TxState.Complete : undefined}
        forceTxHash={withdrawal.txHash}
        disabled={!erc20Approval}
        start={perform}
        reset={reset}
      /> */}
    </div>
  );
};

export default Withdrawals;
