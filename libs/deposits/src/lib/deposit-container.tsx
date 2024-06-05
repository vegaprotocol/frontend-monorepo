import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DepositManager } from './deposit-manager';
import { useEnabledAssets } from '@vegaprotocol/assets';
import compact from 'lodash/compact';
import {
  ARBITRUM_CHAIN_ID,
  ARBITRUM_SEPOLIA_CHAIN_ID,
} from '@vegaprotocol/web3';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: { assetId?: string }) => {
  const { VEGA_ENV } = useEnvironment();
  const { data, error, loading } = useEnabledAssets();

  // It's not possible at this moment to deposit assets that are not on the
  // Ethereum chain, hence we need to filter them out.
  // FIXME: Remove this filtering once the Arbitrum deposits are completed.
  const allowedAssets = compact(data).filter(
    (a) =>
      a.source.__typename === 'ERC20' &&
      Number(a.source.chainId) !== ARBITRUM_CHAIN_ID &&
      Number(a.source.chainId) !== ARBITRUM_SEPOLIA_CHAIN_ID
  );

  return (
    <AsyncRendererInline data={data} loading={loading} error={error}>
      {data && data.length && (
        <DepositManager
          assetId={assetId}
          assets={allowedAssets}
          isFaucetable={VEGA_ENV !== Networks.MAINNET}
        />
      )}
    </AsyncRendererInline>
  );
};
