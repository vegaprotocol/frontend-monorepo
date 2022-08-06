import { gql } from '@apollo/client';
import { assetsConnectionToAssets, t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { WithdrawManager } from '@vegaprotocol/withdraws';
import { ASSET_FRAGMENT } from '../../../lib/query-fragments';
import Link from 'next/link';
import { PageQueryContainer } from '../../../components/page-query-container';
import type {
  WithdrawPageQuery,
  WithdrawPageQueryVariables,
} from './__generated__/WithdrawPageQuery';

const WITHDRAW_PAGE_QUERY = gql`
  ${ASSET_FRAGMENT}
  query WithdrawPageQuery($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawals {
        id
        txHash
      }
      accounts {
        type
        balance
        asset {
          id
          symbol
        }
      }
    }
    assetsConnection {
      edges {
        node {
          ...AssetFields
        }
      }
    }
  }
`;

interface WithdrawPageContainerProps {
  assetId?: string;
}

/**
 *  Fetches data required for the Deposit page
 */
export const WithdrawPageContainer = ({
  assetId,
}: WithdrawPageContainerProps) => {
  const { keypair } = useVegaWallet();

  return (
    <PageQueryContainer<WithdrawPageQuery, WithdrawPageQueryVariables>
      query={WITHDRAW_PAGE_QUERY}
      options={{
        variables: { partyId: keypair?.pub || '' },
        skip: !keypair?.pub,
      }}
      render={(data) => {
        const assets = assetsConnectionToAssets(data.assetsConnection);
        if (!assets.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        const hasIncompleteWithdrawals = data.party?.withdrawals?.some(
          (w) => w.txHash === null
        );

        return (
          <>
            {hasIncompleteWithdrawals ? (
              <p className="mb-6">
                {t('You have incomplete withdrawals.')}{' '}
                <Link href="/portfolio/withdrawals" passHref={true}>
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a
                    className="underline"
                    data-testid="complete-withdrawals-prompt"
                  >
                    {t('Click here to finish withdrawal')}
                  </a>
                </Link>
              </p>
            ) : null}
            <WithdrawManager
              assets={assets}
              accounts={data.party?.accounts || []}
            />
          </>
        );
      }}
    />
  );
};
