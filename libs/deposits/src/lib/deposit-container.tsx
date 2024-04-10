import { useMemo } from 'react';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DepositManager } from './deposit-manager';
import { useEnabledAssets } from '@vegaprotocol/assets';
import { SquidcheckoutWidget } from '@0xsquid/checkout-widget';
import { type AppConfig } from '@0xsquid/checkout-widget/widget/core/types/config';

// Customize here
// https://widget.squidrouter.com/
// const lightStyle = {
//   neutralContent: '#7a6eaa',
//   baseContent: '#280d5f',
//   base100: '#eeeaf4',
//   base200: '#ffffff',
//   base300: '#ffffff',
//   error: '#ed4b9e',
//   warning: '#ffb237',
//   success: '#31d0aa',
//   primary: '#1fc7d4',
//   secondary: '#1fc7d4',
//   secondaryContent: '#280d5f',
//   neutral: '#FFFFFF',
//   roundedBtn: '26px',
//   roundedBox: '1rem',
//   roundedDropDown: '20rem',
//   displayDivider: false,
// };

// const darkStyle = {
//   neutralContent: '#b8add2',
//   baseContent: '#ffffff',
//   base100: '#372f47',
//   base200: '#26272c',
//   base300: '#26272c',
//   error: '#ed4b9e',
//   warning: '#ffb237',
//   success: '#31d0aa',
//   primary: '#1fc7d4',
//   secondary: '#1fc7d4',
//   secondaryContent: '#280d5f',
//   neutral: '#26272c',
//   roundedBtn: '26px',
//   roundedBox: '1rem',
//   roundedDropDown: '20rem',
//   displayDivider: false,
// };

export const DepositContainer = () => {
  // const { theme } = useThemeSwitcher();

  const checkoutConfig = useMemo(() => {
    const config: AppConfig = {
      companyName: 'Vega',
      integratorId: 'vega-swap-widget',
      slippage: 1,
      // @ts-ignore instantExec does not exist on AppConfig, BUT its in the examples, should be fine?
      instantExec: true,
      infiniteApproval: false,
      apiUrl: 'https://testnet.api.squidrouter.com',
      // style: theme === 'dark' ? darkStyle : lightStyle,
      availableChains: {
        destination: [11155111],
      },
      environment: 'testnet',
      checkoutConfig: {
        // introPage: {
        //   title: 'Deposit for vega',
        //   description: 'foo bar buzz quz',
        // //   logoUrl:
        //     'https://icon.vega.xyz/vega/vega-stagnet1-202307191148/asset/fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55/logo.svg',
        // },
        checkoutContract: {
          address: '0xdb10bF403771E44D0456F6C51EE655bb67AB05d9',
          explorerLink: 'https://sepolia.etherscan.io',
        },
        checkoutMode: 'buy',
        item: {
          title: 'Deposit',
          subTitle: 'Deposit to Vega via Squid',
          imageUrl:
            'https://icon.vega.xyz/vega/vega-stagnet1-202307191148/asset/fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55/logo.svg',
        },
        // prefetchData: async () => 1,
        payment: {
          token: {
            chainId: 1,
            address: '0x',
            symbol: 'ETH',
          },
          unitPrice: '',
          nbOfItems: 1,
        },
        customContractCalls: [
          // {
          //   callType: 1;
          //   target: string;
          //   value?: string;
          //   callData: string;
          //   payload?: {
          //       tokenAddress: string;
          //       inputPos: number;
          //   };
          //   estimatedGas: '5000',
          // }
        ],
      },
    };

    return config;
  }, []);

  return (
    <div className="flex gap-10">
      <div className="w-[500px]">
        <SquidcheckoutWidget config={checkoutConfig} />
      </div>
      {/* <div className="w-[500px]">
        <SquidWidget config={normalConfig} />
      </div> */}
      {/* <div className="w-[500px]">
        <SquidStakingWidget config={stakingConfig} />
      </div> */}
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
