import { gql, useQuery } from '@apollo/client';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AccountType } from '../../__generated__/globalTypes';
import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import Routes from '../routes';
import type {
  WithdrawPage,
  WithdrawPageVariables,
} from './__generated__/WithdrawPage';
import { WithdrawManager } from '@vegaprotocol/withdraws';
import { Flags } from '../../config';

const Withdraw = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('withdrawPageHeading')} />
      <p>{t('withdrawPageText')}</p>
      <div className="mb-24">
        <VegaWalletContainer>
          {(currVegaKey) => <WithdrawContainer currVegaKey={currVegaKey} />}
        </VegaWalletContainer>
      </div>
      <Callout title={t('withdrawPageInfoCalloutTitle')}>
        <p className="mb-0">{t('withdrawPageInfoCalloutText')}</p>
      </Callout>
    </>
  );
};

const WITHDRAW_PAGE_QUERY = gql`
  query WithdrawPage($partyId: ID!) {
    party(id: $partyId) {
      id
      accounts {
        balance
        balanceFormatted @client
        type
        asset {
          id
          name
          symbol
          decimals
          source {
            __typename
            ... on ERC20 {
              contractAddress
            }
          }
        }
      }
      withdrawals {
        id
        amount
        asset {
          id
          symbol
          decimals
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
    assets {
      id
      symbol
      name
      decimals
      source {
        ... on ERC20 {
          contractAddress
        }
      }
    }
  }
`;

interface WithdrawContainerProps {
  currVegaKey: VegaKeyExtended;
}

export const WithdrawContainer = ({ currVegaKey }: WithdrawContainerProps) => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<
    WithdrawPage,
    WithdrawPageVariables
  >(WITHDRAW_PAGE_QUERY, {
    variables: { partyId: currVegaKey?.pub },
  });

  const accounts = React.useMemo(() => {
    if (!data?.party?.accounts) return [];
    // You can only withdraw from general accounts
    return data.party.accounts.filter((a) => a.type === AccountType.General);
  }, [data]);

  // Note there is a small period where the withdrawal might have a tx hash but is technically
  // not complete yet as the tx hash gets set before the transaction is confirmed
  const hasPendingWithdrawals = React.useMemo(() => {
    if (!data?.party?.withdrawals?.length) return false;
    return data.party.withdrawals.some((w) => w.txHash === null);
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

  return (
    <>
      {hasPendingWithdrawals && (
        <div className="mb-24">
          <Callout
            title={t('pendingWithdrawalsCalloutTitle')}
            intent={Intent.Warning}
          >
            <p>{t('pendingWithdrawalsCalloutText')}</p>
            <p>
              <Link to={Routes.WITHDRAWALS} className="underline text-white">
                {t('pendingWithdrawalsCalloutButton')}
              </Link>
            </p>
          </Callout>
        </div>
      )}
      <WithdrawManager
        assets={data.assets || []}
        accounts={accounts}
        isNewContract={Flags.USE_NEW_BRIDGE_CONTRACT}
      />
    </>
  );
};

export default Withdraw;
