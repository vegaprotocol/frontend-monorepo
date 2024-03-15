import { useEffect, useState } from 'react';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DepositManager } from './deposit-manager';
import { useEnabledAssets } from '@vegaprotocol/assets';

export const DepositContainer = () => {
  const [mod, setMod] = useState();
  const config = {
    companyName: 'Squid Widget',
    integratorId: '<your integrator id>',
    slippage: 1,
    instantExec: true,
    infiniteApproval: false,
    apiUrl: 'https://api.squidrouter.com',
  };

  useEffect(() => {
    (async () => {
      const res = await import('@0xsquid/widget');
      setMod(res);
    })();
  }, []);

  if (mod) {
    return <mod.SquidWidget config={config} />;
  }

  return <div>here</div>;
};

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainerOld = ({ assetId }: { assetId?: string }) => {
  const { VEGA_ENV } = useEnvironment();
  const { data, error, loading } = useEnabledAssets();

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
