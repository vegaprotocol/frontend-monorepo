import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { format } from 'date-fns';
import orderBy from 'lodash/orderBy';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../components/heading';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { BigNumber } from '../../lib/bignumber';
import { DATE_FORMAT_DETAILED } from '../../lib/date-formats';
import { addDecimal } from '../../lib/decimals';
import { truncateMiddle } from '../../lib/truncate-middle';
import type { Withdrawals_party_withdrawals } from '@vegaprotocol/withdraws';
import { useCompleteWithdraw, useWithdrawals } from '@vegaprotocol/withdraws';
import { WithdrawalStatus } from '@vegaprotocol/types';

const Withdrawals = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('withdrawalsTitle')} />
      <VegaWalletContainer>
        {(currVegaKey) => <WithdrawPendingContainer />}
      </VegaWalletContainer>
    </>
  );
};

const WithdrawPendingContainer = () => {
  const { t } = useTranslation();
  const { submit, Dialog } = useCompleteWithdraw();
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
      <p className="mb-28">{t('withdrawalsPreparedWarningText')}</p>
      <ul role="list">
        {withdrawals.map((w) => (
          <li key={w.id} className="mb-28">
            <Withdrawal withdrawal={w} complete={submit} />
          </li>
        ))}
      </ul>
      <Dialog />
    </>
  );
};

interface WithdrawalProps {
  withdrawal: Withdrawals_party_withdrawals;
  complete: (withdrawalId: string) => void;
}

export const Withdrawal = ({ withdrawal, complete }: WithdrawalProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  let status;
  let footer = null;

  if (withdrawal.pendingOnForeignChain) {
    status = t('Pending');
    footer = (
      <Button
        fill={true}
        disabled={true}
        onClick={() => complete(withdrawal.id)}
      >
        {t('withdrawalsCompleteButton')}
      </Button>
    );
  } else if (withdrawal.status === WithdrawalStatus.STATUS_FINALIZED) {
    if (withdrawal.txHash) {
      status = t('Complete');
    } else {
      status = t('Incomplete');
      footer = (
        <Button fill={true} onClick={() => complete(withdrawal.id)}>
          {t('withdrawalsCompleteButton')}
        </Button>
      );
    }
  } else {
    status = withdrawal.status;
  }

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
            <Link
              title={t('View on Etherscan (opens in a new tab)')}
              href={`${ETHERSCAN_URL}/tx/${withdrawal.details?.receiverAddress}`}
              target="_blank"
            >
              {truncateMiddle(withdrawal.details?.receiverAddress ?? '')}
            </Link>
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
              <Link
                title={t('View transaction on Etherscan')}
                href={`${ETHERSCAN_URL}/tx/${withdrawal.txHash}`}
                target="_blank"
              >
                {truncateMiddle(withdrawal.txHash)}
              </Link>
            ) : (
              '-'
            )}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('status')}
          {status}
        </KeyValueTableRow>
      </KeyValueTable>
      {footer}
    </div>
  );
};

export default Withdrawals;
