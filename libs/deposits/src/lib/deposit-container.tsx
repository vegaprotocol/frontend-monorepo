import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3Container } from '@vegaprotocol/web3';
import { DepositManager } from './deposit-manager';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { enabledAssetsProvider } from '@vegaprotocol/assets';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: { assetId?: string }) => {
  const { VEGA_ENV } = useEnvironment();
  const { data, loading, error } = useDataProvider({
    dataProvider: enabledAssetsProvider,
  });

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {data && data.length ? (
        <Web3Container>
          <DepositManager
            assetId={assetId}
            assets={data}
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
