import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DepositManager } from './deposit-manager';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { enabledAssetsProvider } from '@vegaprotocol/assets';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: { assetId?: string }) => {
  const { VEGA_ENV } = useEnvironment();
  const { data, loading, error } = useDataProvider({
    dataProvider: enabledAssetsProvider,
    variables: undefined,
  });

  return (
    <AsyncRendererInline data={data} loading={loading} error={error}>
      {data && data.length && (
        <DepositManager
          assetId={assetId}
          assets={data}
          isFaucetable={VEGA_ENV !== Networks.MAINNET}
        />
      )}
    </AsyncRendererInline>
  );
};
