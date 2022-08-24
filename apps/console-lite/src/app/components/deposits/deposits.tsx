import { gql, useQuery } from '@apollo/client';
import { DepositManager } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Web3Container } from '@vegaprotocol/web3';
import type { Deposits } from './__generated__/Deposits';

const DEPOSITS_QUERY = gql`
  query Deposits {
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

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = () => {
  const { VEGA_ENV } = useEnvironment();
  const { keypair } = useVegaWallet();

  const { data, loading, error } = useQuery<Deposits>(DEPOSITS_QUERY, {
    variables: { partyId: keypair?.pub },
    skip: !keypair?.pub,
  });

  return (
    <AsyncRenderer<Deposits> data={data} loading={loading} error={error}>
      {data?.assets?.length ? (
        <Web3Container>
          <DepositManager
            assets={data.assets}
            isFaucetable={VEGA_ENV !== 'MAINNET'}
          />
        </Web3Container>
      ) : (
        <Splash>
          <p>{t('No assets on this network')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
