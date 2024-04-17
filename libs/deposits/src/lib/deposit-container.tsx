import { useMemo } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { SquidcheckoutWidget } from '@0xsquid/checkout-widget';
import {
  type AppConfig as CheckouAppConfig,
  type CheckoutMode,
} from '@0xsquid/checkout-widget/widget/core/types/config';
import { useWeb3React } from '@web3-react/core';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const DepositContainer = () => {
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

    // call data for approval
    const approveEncodeData = ausdcContract.interface.encodeFunctionData(
      'approve',
      [stagBridge, 0]
    );

    // call data for deposit
    const depositEncodedData = bridgeContract.interface.encodeFunctionData(
      'deposit_asset',
      [stagAUSDC, 0, '0x' + pubKey]
    );

    const config: CheckouAppConfig = {
      companyName: 'Vega',
      integratorId: 'vega-swap-widget',
      slippage: 1,
      infiniteApproval: false,
      apiUrl: 'https://testnet.api.squidrouter.com',
      availableChains: {
        destination: [11155111],
      },
      checkoutConfig: {
        checkoutContract: {
          // I've put our bridge contract here, but not sure thats correct
          address: stagBridge,
          explorerLink:
            'https://sepolia.etherscan.io/address/0x3152207Cb8B251AdF88628554a1422AA2b734F61',
        },
        item: {
          title: pubKey || 'Select key',
          subTitle: 'Deposit to',
          imageUrl:
            'https://icon.vega.xyz/vega/vega-stagnet1-202307191148/asset/fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55/logo.svg',
        },
        checkoutMode: 'buy' as CheckoutMode.BUY,

        // Not sure how this should be set up for our use case
        payment: {
          token: {
            chainId: 11155111,
            address: '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4',
            symbol: 'tEURO',
          },
          unitPrice: '1',
          nbOfItems: 1,
        },
        customContractCalls: [
          // approve deposits
          {
            callType: 1,
            target: () => stagAUSDC,
            value: '0', // native value to be sent with call
            callData: () => approveEncodeData,
            payload: {
              tokenAddress: stagAUSDC,
              inputPos: 1,
            },
            estimatedGas: '50000',
          },

          // call deposit_asset on vega collateral beridge
          {
            callType: 1,
            target: () => stagBridge,
            value: '0',
            callData: () => depositEncodedData,
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
  }, [provider, pubKey]);

  return (
    <div className="w-[500px]">
      <div>Sending to: {pubKey}</div>
      <SquidcheckoutWidget config={checkoutConfig} />
    </div>
  );
};
