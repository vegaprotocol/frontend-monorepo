import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import { AsyncRenderer, Button, Dialog } from '@vegaprotocol/ui-toolkit';
import {
  useWithdrawals,
  WithdrawalsTable,
  WithdrawManager,
} from '@vegaprotocol/withdraws';
import { t } from '@vegaprotocol/react-helpers';
import { useMemo, useState } from 'react';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { Web3Container } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { gql, useQuery } from '@apollo/client';

export const WithdrawalsContainer = () => {
  const { keypair } = useVegaWallet();
  const { data, loading, error } = useWithdrawals();
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const withdrawals = useMemo(() => {
    return orderBy(
      compact(data?.party?.withdrawalsConnection.edges).map(
        (edge) => edge.node
      ),
      (w) => new Date(w.createdTimestamp).getTime(),
      'desc'
    );
  }, [data]);

  return (
    <Web3Container>
      <VegaWalletContainer>
        <div className="h-full grid gap-4 grid-rows-[min-content_1fr]">
          <header className="flex justify-between items-center p-4">
            <h4 className="text-lg text-black dark:text-white">
              {t('Withdrawals')}
            </h4>
            <Button onClick={() => setWithdrawDialog(true)}>Withdraw</Button>
          </header>
          <div>
            <AsyncRenderer
              data={withdrawals}
              loading={loading}
              error={error}
              render={(data) => {
                return <WithdrawalsTable withdrawals={data} />;
              }}
            />
          </div>
        </div>
        <Dialog
          title={t('Withdraw')}
          open={withdrawDialog}
          onChange={(isOpen) => setWithdrawDialog(isOpen)}
        >
          <WithdrawFormContainer partyId={keypair?.pub} />
        </Dialog>
      </VegaWalletContainer>
    </Web3Container>
  );
};

export const ASSET_FRAGMENT = gql`
  fragment AssetFields on Asset {
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
`;

const WITHDRAW_FORM_QUERY = gql`
  ${ASSET_FRAGMENT}
  query WithdrawFormQuery($partyId: ID!) {
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

const WithdrawFormContainer = ({ partyId }: { partyId?: string }) => {
  const { data, loading, error } = useQuery(WITHDRAW_FORM_QUERY, {
    variables: { partyId },
  });

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong</div>;
  }

  return (
    <WithdrawManager
      assets={data.assets}
      accounts={data.party?.accounts || []}
    />
  );
};
