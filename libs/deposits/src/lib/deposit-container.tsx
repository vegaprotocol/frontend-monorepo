import { useMemo } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { SquidcheckoutWidget } from '@0xsquid/checkout-widget';
// import { SquidWidget } from '@0xsquid/widget';
// import { type AppConfig } from '@0xsquid/widget/widget/core/types/config';
import { type AppConfig as CheckouAppConfig } from '@0xsquid/checkout-widget/widget/core/types/config';
import { useWeb3React } from '@web3-react/core';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const DepositContainer = () => {
  // https://widget.squidrouter.com/
  // const { theme } = useThemeSwitcher();
  const { provider } = useWeb3React();
  const { pubKey } = useVegaWallet();

  const checkoutConfig = useMemo(() => {
    const stagBridge = '0x3152207Cb8B251AdF88628554a1422AA2b734F61';
    const stagAUSDC = '0x254d06f33bDc5b8ee05b2ea472107E300226659A';

    const ausdcContract = new ethers.Contract(
      stagAUSDC,
      ERC20_ABI,
      provider?.getSigner()
    );

    const bridgeContract = new ethers.Contract(
      stagBridge,
      BRIDGE_ABI,
      provider?.getSigner()
    );

    const approveEncodeData = ausdcContract.interface.encodeFunctionData(
      'approve',
      [stagBridge, 0]
    );

    const depositEncodedData = bridgeContract.interface.encodeFunctionData(
      'deposit_asset',
      [stagAUSDC, 0, '0x' + pubKey]
    );

    const config: CheckouAppConfig = {
      companyName: 'Vega',
      integratorId: 'vega-swap-widget',
      slippage: 1,
      // @ts-ignore instantExec does not exist on AppConfig, BUT its in the examples, should be fine?
      instantExec: true,
      infiniteApproval: false,
      apiUrl: 'https://testnet.api.squidrouter.com',
      availableChains: {
        destination: [11155111],
      },
      environment: 'testnet',
      checkoutConfig: {
        checkoutContract: {
          address: '0xdb10bF403771E44D0456F6C51EE655bb67AB05d9',
          explorerLink: 'https://sepolia.etherscan.io',
        },
        checkoutMode: 'buy',
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
          {
            callType: SquidCallType.FULL_TOKEN_BALANCE,
            target: stagAUSDC,
            value: '0', // native value to be sent with call
            callData: approveEncodeData,
            payload: {
              tokenAddress: stagAUSDC, // balance of this token replaces 0 on line 13
              inputPos: 1,
            },
            estimatedGas: '50000',
          },
          {
            callType: SquidCallType.FULL_TOKEN_BALANCE,
            target: stagBridge,
            value: '0',
            callData: depositEncodedData,
            payload: {
              tokenAddress: stagAUSDC,
              inputPos: 1,
            },
            estimatedGas: '50000',
          },
        ],
      },
    };

    return config;
  }, [provider]);

  return (
    <div className="w-[500px]">
      <SquidcheckoutWidget config={checkoutConfig} />
      {/* <SquidWidget config={{
        integratorId: 'vega-swap-widget',
      }} /> */}
    </div>
  );
};
