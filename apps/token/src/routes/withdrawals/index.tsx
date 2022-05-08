import { Splash } from '@vegaprotocol/ui-toolkit';
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
import { BigNumber } from '../../lib/bignumber';
import { DATE_FORMAT_DETAILED } from '../../lib/date-formats';
import { addDecimal } from '../../lib/decimals';
import { truncateMiddle } from '../../lib/truncate-middle';
import type { Withdrawals_party_withdrawals } from '@vegaprotocol/withdraws';
import { useCompleteWithdraw, useWithdrawals } from '@vegaprotocol/withdraws';
import { TransactionDialog } from '@vegaprotocol/web3';
import { WithdrawalStatus } from '../../__generated__/globalTypes';

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

const WithdrawPendingContainer = ({
  currVegaKey,
}: WithdrawPendingContainerProps) => {
  const { t } = useTranslation();
  const { transaction, submit } = useCompleteWithdraw();
  const { data, loading, error } = useWithdrawals();

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
            <Withdrawal withdrawal={w} complete={submit} />
          </li>
        ))}
      </ul>
      <TransactionDialog name="withdraw" {...transaction} />
    </>
  );
};

interface WithdrawalProps {
  withdrawal: Withdrawals_party_withdrawals;
  complete: (withdrawalId: string) => void;
}

export const Withdrawal = ({ withdrawal, complete }: WithdrawalProps) => {
  const { t } = useTranslation();

  const renderStatus = ({
    id,
    status,
    txHash,
    pendingOnForeignChain,
  }: Withdrawals_party_withdrawals) => {
    if (pendingOnForeignChain) {
      return t('Pending');
    }

    if (status === WithdrawalStatus.Finalized) {
      if (txHash) {
        return t('Complete');
      } else {
        return (
          <>
            {t('Incomplete')}{' '}
            <button
              className="text-white underline"
              onClick={() => complete(id)}
            >
              {t('withdrawalsCompleteButton')}
            </button>
          </>
        );
      }
    }

    return status;
  };

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
        <KeyValueTableRow>
          {t('withdrawalTransaction', { foreignChain: 'Ethereum' })}
          <span>
            {withdrawal.txHash ? (
              <EtherscanLink
                tx={withdrawal.txHash}
                text={truncateMiddle(withdrawal.txHash)}
              />
            ) : (
              '-'
            )}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('status')}
          {renderStatus(withdrawal)}
        </KeyValueTableRow>
      </KeyValueTable>
    </div>
  );
};

export default Withdrawals;
