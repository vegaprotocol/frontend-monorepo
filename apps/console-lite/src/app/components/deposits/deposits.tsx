import { useMemo } from 'react';
import { DepositManager } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { enabledAssetsProvider } from '@vegaprotocol/assets';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Web3Container } from '@vegaprotocol/web3';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = () => {
  const { VEGA_ENV } = useEnvironment();
  const { pubKey } = useVegaWallet();
  const variables = useMemo(() => ({ partyId: pubKey }), [pubKey]);
  const { data, loading, error } = useDataProvider({
    dataProvider: enabledAssetsProvider,
    variables,
    skip: !pubKey,
  });

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {data && data.length ? (
        <Web3Container>
          <DepositManager
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
