import { gql, useQuery } from '@apollo/client';
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
import type {
  WithdrawalsPage,
  WithdrawalsPage_party_withdrawals,
  WithdrawalsPageVariables,
} from './__generated__/WithdrawalsPage';
import { useCompleteWithdraw } from '@vegaprotocol/withdraws';
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
  const { transaction, submit } = useCompleteWithdraw();
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
            <Withdrawal withdrawal={w} complete={submit} />
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
        <KeyValueTableRow>
          {t('Ethereum transaction')}
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
          {withdrawal.txHash
            ? t('Complete')
            : withdrawal.status === WithdrawalStatus.Finalized
            ? 'Incomplete'
            : withdrawal.status}
        </KeyValueTableRow>
      </KeyValueTable>
      <p>
        {withdrawal.txHash ? null : (
          <button
            className="underline text-white hover:text-vega-yellow"
            onClick={() => complete(withdrawal.id)}
          >
            {t('Finish withdrawal')}
          </button>
        )}
      </p>
    </div>
  );
};

export default Withdrawals;
