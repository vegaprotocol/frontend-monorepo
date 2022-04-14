import { gql } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { CreateWithdrawManager } from '@vegaprotocol/withdraws';
import Link from 'next/link';
import { PageQueryContainer } from '../../../components/page-query-container';
import type {
  WithdrawPage,
  WithdrawPageVariables,
} from './__generated__/WithdrawPage';

const WITHDRAW_PAGE_QUERY = gql`
  query WithdrawPage($partyId: ID!) {
    party(id: $partyId) {
      withdrawals {
        id
        status
        amount
        asset {
          id
          symbol
          decimals
        }
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
    <PageQueryContainer<WithdrawPage, WithdrawPageVariables>
      query={WITHDRAW_PAGE_QUERY}
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

        return (
          <>
            {data.party?.withdrawals?.length && (
              <p className="mb-12">
                You have pending withdrawals.{' '}
                <Link href="/portfolio/withdraw/pending">
                  <a className="underline">Click here to complete</a>
                </Link>
              </p>
            )}
            <CreateWithdrawManager
              // @ts-ignore TS not inferring on union type for contract address
              assets={data.assets.filter(
                (a) => a.source.__typename === 'ERC20'
              )}
              initialAssetId={assetId}
            />
          </>
        );
      }}
    </PageQueryContainer>
  );
};
