import { useMemo } from 'react';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DepositManager } from './deposit-manager';
import { useEnabledAssets } from '@vegaprotocol/assets';
import { SquidWidget } from '@0xsquid/widget';
import { type AppConfig } from '@0xsquid/widget/widget/core/types/config';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

// Customize here
// https://widget.squidrouter.com/
const lightStyle = {};
const darkStyle = {};

export const DepositContainer = () => {
  const { theme } = useThemeSwitcher();
  const config = useMemo(() => {
    const config: AppConfig = {
      companyName: 'Vega',
      integratorId: 'vega-swap-widget',
      slippage: 1,
      // @ts-ignore instantExec does not exist on AppConfig, BUT its in the examples, should be fine?
      instantExec: true,
      infiniteApproval: false,
      apiUrl: 'https://api.squidrouter.com',
      style: theme === 'dark' ? darkStyle : lightStyle,
      availableChains: {
        destination: [42161],
      },
    };

    return config;
  }, [theme]);

  return (
    <div>
      <SquidWidget config={config} />
    </div>
  );
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
