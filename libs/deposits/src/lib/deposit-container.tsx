import { useMemo } from 'react';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DepositManager } from './deposit-manager';
import { useEnabledAssets } from '@vegaprotocol/assets';
import { SquidStakingWidget } from '@0xsquid/staking-widget';
import { SquidcheckoutWidget } from '@0xsquid/checkout-widget';
import { type AppConfig as StakingAppConfig } from '@0xsquid/staking-widget/widget/core/types/config';
import {
  type AppConfig as CheckoutAppConfig,
  CheckoutMode,
} from '@0xsquid/checkout-widget/widget/core/types/config';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

// Customize here
// https://widget.squidrouter.com/
const lightStyle = {
  neutralContent: '#7a6eaa',
  baseContent: '#280d5f',
  base100: '#eeeaf4',
  base200: '#ffffff',
  base300: '#ffffff',
  error: '#ed4b9e',
  warning: '#ffb237',
  success: '#31d0aa',
  primary: '#1fc7d4',
  secondary: '#1fc7d4',
  secondaryContent: '#280d5f',
  neutral: '#FFFFFF',
  roundedBtn: '26px',
  roundedBox: '1rem',
  roundedDropDown: '20rem',
  displayDivider: false,
}

const darkStyle = {
  neutralContent: '#b8add2',
  baseContent: '#ffffff',
  base100: '#372f47',
  base200: '#26272c',
  base300: '#26272c',
  error: '#ed4b9e',
  warning: '#ffb237',
  success: '#31d0aa',
  primary: '#1fc7d4',
  secondary: '#1fc7d4',
  secondaryContent: '#280d5f',
  neutral: '#26272c',
  roundedBtn: '26px',
  roundedBox: '1rem',
  roundedDropDown: '20rem',
  displayDivider: false,
}

export const DepositContainer = () => {
  const { theme } = useThemeSwitcher();

  const checkoutConfig = useMemo(() => {
    const config: CheckoutAppConfig = {
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
      checkoutConfig: {
        introPage: {
          title: 'checkout title',
          description: 'checkout description',
          logoUrl: 'logoUrl',
        },
        checkoutContract: {
          address: '0xdb10bF403771E44D0456F6C51EE655bb67AB05d9',
          explorerLink: 'https://sepolia.etherscan.io',
        },
        checkoutMode: CheckoutMode.BUY,
        item: {
          title: 'item title',
          subTitle: 'item subTitle',
          imageUrl: 'tiem imageurl',
        },
        prefetchData: async () => 1,
        payment: {
          token: {
            chainId: 1,
            address: '0xdb10bF403771E44D0456F6C51EE655bb67AB05d9',
            symbol: 'payment symbol',
          },
          unitPrice: '',
          nbOfItems: 1,
        },
        customContractCalls: [],
      },
    };

    return config;
  }, [theme]);

  const stakingConfig = useMemo(() => {
    const config: StakingAppConfig = {
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
      // stakeConfig: {
      //   tokensConfig: [
      //     {
      //       stakedToken: {
      //         chainId: 1,
      //         address: '0xfooo',
      //         name: 'something',
      //         symbol: 'symbol',
      //         decimals: 18,
      //         logoURI: '',
      //         coingeckoId: '',
      //         commonKey: '',
      //         bridgeOnly: true,
      //         ibcDenom: '',
      //         codeHash: '',
      //       },
      //       stakedTokenExchangeRateGetter: async () => 1,
      //       tokenToStake: {
      //         chainId: 1,
      //         address: '',
      //       },
      //       customContractCalls: [],
      //       unstakeLink: '',
      //       logoUrl: '',
      //       stakingContract: {
      //         address: '',
      //         explorerLink: '',
      //       },
      //     },
      //   ],
      //   introPage: {
      //     title: 'intro page title',
      //     description: 'intro page description',
      //     onClose: () => console.log('onClose'),
      //   },
      // },
    };

    return config;
  }, [theme]);

  return (
    <div className="flex gap-10">
      <div><SquidcheckoutWidget config={checkoutConfig} />></div>
      <div>
        <SquidStakingWidget config={stakingConfig} />
      </div>
    </div>
  );
};

// <div>
//   <SquidcheckoutWidget config={checkoutConfig} />
// </div>

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
