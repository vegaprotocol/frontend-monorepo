import { gql, useQuery } from '@apollo/client';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AccountType } from '../../__generated__/globalTypes';
import { EthWalletContainer } from '../../components/eth-wallet-container';
import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { Routes } from '../router-config';
import type {
  WithdrawPage,
  WithdrawPageVariables,
  WithdrawPage_party_accounts_asset,
} from './__generated__/WithdrawPage';
import { WithdrawManager } from '@vegaprotocol/withdraws';

const Withdraw = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('withdrawPageHeading')} />
      <p>{t('withdrawPageText')}</p>
      <VegaWalletContainer>
        {(currVegaKey) => <WithdrawContainer currVegaKey={currVegaKey} />}
      </VegaWalletContainer>
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
        <Callout
          title={t('pendingWithdrawalsCalloutTitle')}
          intent={Intent.Prompt}
        >
          <p>{t('pendingWithdrawalsCalloutText')}</p>
          <p className="mb-0">
            <Link to={Routes.WITHDRAWALS}>
              {t('pendingWithdrawalsCalloutButton')}
            </Link>
          </p>
        </Callout>
      )}
      <EthWalletContainer>
        {() => (
          <WithdrawManager
            assets={data.assets?.filter(isERC20Asset) || []}
            accounts={accounts}
          />
        )}
      </EthWalletContainer>
    </>
  );
};

export default Withdraw;

// TODO: This is duplicated in trading/lib/asset we should make this sharable
export interface ERC20Asset extends WithdrawPage_party_accounts_asset {
  source: {
    __typename: 'ERC20';
    contractAddress: string;
  };
}

type UnknownAsset = Pick<
  WithdrawPage_party_accounts_asset,
  '__typename' | 'source'
>;

// Type guard to ensure an asset is an ERC20 token
export const isERC20Asset = (asset: UnknownAsset): asset is ERC20Asset => {
  if (asset.source.__typename === 'ERC20') {
    return true;
  }
  return false;
};
