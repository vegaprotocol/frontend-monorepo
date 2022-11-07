import { DepositManager } from '@vegaprotocol/deposits';
import { useDataProvider, t } from '@vegaprotocol/react-helpers';
import { enabledAssetsProvider } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = () => {
  const { VEGA_ENV } = useEnvironment();
  const { data, error, loading } = useDataProvider({
    dataProvider: enabledAssetsProvider,
  });
  return (
    <AsyncRenderer
      data={data}
      error={error}
      loading={loading}
      render={(assets) => {
        if (!assets || !assets.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        return (
          <DepositManager
            assets={assets}
            isFaucetable={VEGA_ENV !== 'MAINNET'}
          />
        );
      }}
    />
  );
};
