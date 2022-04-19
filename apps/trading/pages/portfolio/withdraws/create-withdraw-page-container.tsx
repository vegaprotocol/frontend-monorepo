import { gql } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { WithdrawManager } from '@vegaprotocol/withdraws';
import Link from 'next/link';
import { PageQueryContainer } from '../../../components/page-query-container';
import type {
  CreateWithdrawPage,
  CreateWithdrawPageVariables,
} from './__generated__/CreateWithdrawPage';

const CREATE_WITHDRAW_PAGE_QUERY = gql`
  query CreateWithdrawPage($partyId: ID!) {
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
    <PageQueryContainer<CreateWithdrawPage, CreateWithdrawPageVariables>
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
            {pendingWithdrawals?.length && (
              <p className="mb-12">
                {t('You have incomplete withdrawals.')}{' '}
                <Link href="/portfolio/withdraws">
                  <a className="underline">
                    {t('Click here to finish withdrawal')}
                  </a>
                </Link>
              </p>
            )}
            <WithdrawManager
              // @ts-ignore TS not inferring on union type for contract address
              assets={data.assets.filter(
                (a) => a.source.__typename === 'ERC20'
              )}
              accounts={data.party?.accounts || []}
              initialAssetId={assetId}
            />
          </>
        );
      }}
    </PageQueryContainer>
  );
};
