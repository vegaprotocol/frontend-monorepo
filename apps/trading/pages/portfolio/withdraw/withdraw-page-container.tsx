import { gql } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { WithdrawManager } from '@vegaprotocol/withdraws';
import { ASSET_FRAGMENT } from '../../../lib/query-fragments';
import Link from 'next/link';
import { PageQueryContainer } from '../../../components/page-query-container';
import { isERC20Asset } from '../../../lib/assets';
import type {
  WithdrawPageQuery,
  WithdrawPageQueryVariables,
} from './__generated__/WithdrawPageQuery';

const CREATE_WITHDRAW_PAGE_QUERY = gql`
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
    assets {
      ...AssetFields
    }
  }
`;

interface CreateWithdrawPageContainerProps {
  assetId?: string;
}

/**
 *  Fetches data required for the Deposit page
 */
export const CreateWithdrawPageContainer = ({
  assetId,
}: CreateWithdrawPageContainerProps) => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return <p>{t('Please connect your Vega wallet')}</p>;
  }

  return (
    <PageQueryContainer<WithdrawPageQuery, WithdrawPageQueryVariables>
      query={CREATE_WITHDRAW_PAGE_QUERY}
      options={{
        variables: { partyId: keypair?.pub || '' },
        skip: !keypair?.pub,
      }}
    >
      {(data) => {
        if (!data.assets?.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        const pendingWithdrawals = data.party?.withdrawals?.filter(
          (w) => w.txHash
        );

        return (
          <>
            {pendingWithdrawals?.length ? (
              <p className="mb-12">
                {t('You have incomplete withdrawals.')}{' '}
                <Link href="/portfolio/withdrawals">
                  <a className="underline">
                    {t('Click here to finish withdrawal')}
                  </a>
                </Link>
              </p>
            ) : null}
            <WithdrawManager
              assets={data.assets.filter(isERC20Asset)}
              accounts={data.party?.accounts || []}
              initialAssetId={assetId}
            />
          </>
        );
      }}
    </PageQueryContainer>
  );
};
