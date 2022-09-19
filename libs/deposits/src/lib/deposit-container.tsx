import { gql, useQuery } from '@apollo/client';
import { getEnabledAssets, t } from '@vegaprotocol/react-helpers';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Web3Container } from '@vegaprotocol/web3';
import type { Deposits } from './__generated__/Deposits';
import { DepositManager } from './deposit-manager';

const DEPOSITS_QUERY = gql`
  query DepositAsset {
    assetsConnection {
      edges {
        node {
          id
          name
          symbol
          decimals
          status
          source {
            ... on ERC20 {
              contractAddress
            }
          }
        }
      }
    }
  }
`;

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: { assetId: string }) => {
  const { VEGA_ENV } = useEnvironment();
  const { keypair } = useVegaWallet();

  const { data, loading, error } = useQuery<Deposits>(DEPOSITS_QUERY, {
    variables: { partyId: keypair?.pub },
    skip: !keypair?.pub,
  });

  const assets = getEnabledAssets(data);

  return (
    <AsyncRenderer<Deposits> data={data} loading={loading} error={error}>
      {assets.length ? (
        <Web3Container>
          <DepositManager
            assetId={assetId}
            assets={assets}
            isFaucetable={VEGA_ENV !== Networks.MAINNET}
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
