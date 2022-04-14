import { gql } from '@apollo/client';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { PageQueryContainer } from '../../../components/page-query-container';
import { Web3Container } from '../../../components/web3-container';
import { WithdrawalsList } from './withdrawals-list';
import type {
  WithdrawsPage,
  WithdrawsPageVariables,
} from './__generated__/WithdrawsPage';

const WITHDRAWS_PAGE_QUERY = gql`
  query WithdrawsPage($partyId: ID!) {
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
  }
`;

const Withdraws = () => {
  const { keypair } = useVegaWallet();

  return (
    <Web3Container>
      {() => (
        <PageQueryContainer<WithdrawsPage, WithdrawsPageVariables>
          query={WITHDRAWS_PAGE_QUERY}
          options={{
            variables: { partyId: keypair?.pub || '' },
            skip: !keypair?.pub,
          }}
        >
          {(data, { refetch }) => {
            return (
              <div className="p-24">
                <h1 className="text-h3 mb-12">Pending Withdrawals</h1>
                <WithdrawalsList
                  withdrawals={data.party?.withdrawals || []}
                  refetchWithdrawals={refetch}
                />
              </div>
            );
          }}
        </PageQueryContainer>
      )}
    </Web3Container>
  );
};

export default Withdraws;
