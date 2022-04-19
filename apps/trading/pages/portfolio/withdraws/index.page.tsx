import { gql } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton, Splash } from '@vegaprotocol/ui-toolkit';
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
      id
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

  if (!keypair) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

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
              <div className="h-full grid grid grid-rows-[min-content,1fr]">
                <header className="flex justify-between p-24">
                  <h1 className="text-h3">{t('Withdrawals')}</h1>
                  <AnchorButton href="/portfolio/withdraws/create">
                    {t('Start withdrawal')}
                  </AnchorButton>
                </header>
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
