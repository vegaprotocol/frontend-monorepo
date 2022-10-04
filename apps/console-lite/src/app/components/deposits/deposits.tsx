import { gql, useQuery } from '@apollo/client';
import { DepositManager } from '@vegaprotocol/deposits';
import { getEnabledAssets, t } from '@vegaprotocol/react-helpers';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Web3Container } from '@vegaprotocol/web3';
import type { DepositAssets } from './__generated__/DepositAssets';

const DEPOSITS_QUERY = gql`
  query DepositAssets {
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
export const DepositContainer = () => {
  const { VEGA_ENV } = useEnvironment();
  const { pubKey } = useVegaWallet();

  const { data, loading, error } = useQuery<DepositAssets>(DEPOSITS_QUERY, {
    variables: { partyId: pubKey },
    skip: !pubKey,
  });

  const assets = getEnabledAssets(data);

  return (
    <AsyncRenderer<DepositAssets> data={data} loading={loading} error={error}>
      {assets.length ? (
        <Web3Container>
          <DepositManager
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
