import { gql, useQuery } from '@apollo/client';
import { DepositManager } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { AssetStatus } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Web3Container } from '@vegaprotocol/web3';
import type { Deposits } from './__generated__/Deposits';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetFieldsFragmentDoc } from '@vegaprotocol/assets';

const DEPOSITS_QUERY = gql`
  ${AssetFieldsFragmentDoc}
  query Deposits {
    assetsConnection {
      edges {
        node {
          ...AssetFields
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

  const assets = (data?.assetsConnection.edges || []).reduce<
    AssetFieldsFragment[]
  >((acc, edge) => {
    if (edge?.node && edge.node?.status === AssetStatus.STATUS_ENABLED) {
      // @ts-ignore temporary fix until this whole thing gets migrated over so it recognizes each other's types
      acc.push(edge.node);
    }
    return acc;
  }, []);

  return (
    <AsyncRenderer<Deposits> data={data} loading={loading} error={error}>
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
