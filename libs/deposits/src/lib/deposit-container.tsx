import {
  Squid,
  type TokenData,
  type ChainData,
  SquidCallType,
} from '@0xsquid/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { BRIDGE_ABI, ERC20_ABI } from '@vegaprotocol/smart-contracts';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
// import {
//   ChainData,
//   SquidCallType,
//   Token,
// } from '@0xsquid/squid-types';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: { assetId?: string }) => {
  const { account, provider } = useWeb3React();
  const { pubKey } = useVegaWallet();
  const openDialog = useWeb3ConnectStore((store) => store.open);

  const squid = useRef(
    new Squid({
      baseUrl: 'https://api.squidrouter.com',
      integratorId: 'vega-swap-widget',
    })
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [ready, setready] = useState(false);
  const [chains, setChains] = useState<ChainData[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);

  const [fromChain, setFromChain] = useState<string>();

  useEffect(() => {
    const run = async () => {
      await squid.current.init();
      console.log('squid inited');
      setready(true);

      setChains(squid.current.chains);
      setTokens(squid.current.tokens);
    };

    run();
  }, []);

  if (!ready) {
    return <div>Loading</div>;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!provider) return;
    if (!account) return;

    if (!pubKey) return;

    if (!formRef.current) return;
    if (!squid.current) return;

    if (!account) {
      alert('Connect wallet');
      return;
    }

    const formData = new FormData(formRef.current);

    const fromChain = formData.get('chain')?.toString();
    const fromToken = formData.get('token')?.toString();
    const fromAmount = formData.get('amount')?.toString();

    if (!fromChain) return;
    if (!fromToken) return;
    if (!fromAmount) return;

    console.log(
      chains,
      tokens?.filter((t) => t.chainId.toString() === fromChain?.toString()),
      fromChain,
      fromToken
    );

    const bridgeAddress = '0x23872549cE10B40e31D6577e0A920088B0E0666a';
    const USDCMainnet = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    const usdcMainnetContract = new ethers.Contract(
      USDCMainnet,
      ERC20_ABI,
      provider.getSigner()
    );

    const bridgeContract = new ethers.Contract(
      bridgeAddress,
      BRIDGE_ABI,
      provider.getSigner()
    );

    const approveEncodeData = usdcMainnetContract.interface.encodeFunctionData(
      'approve',
      [bridgeAddress, 0]
    );

    const depositEncodedData = bridgeContract.interface.encodeFunctionData(
      'deposit_asset',
      [USDCMainnet, 0, '0x' + pubKey]
    );

    const { route, ...rest } = await squid.current.getRoute({
      fromChain,
      fromToken,
      fromAmount,
      toChain: '1',
      toToken: USDCMainnet,
      fromAddress: account,
      toAddress: account,
      slippage: 1,
      customContractCalls: [
        {
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          target: USDCMainnet,
          value: '0', // native value to be sent with call
          callData: approveEncodeData,
          payload: {
            tokenAddress: USDCMainnet, // balance of this token replaces 0 on line 13
            inputPos: 1,
          },
          estimatedGas: '50000',
        },
        {
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          target: bridgeAddress,
          value: '0',
          callData: depositEncodedData,
          payload: {
            tokenAddress: USDCMainnet,
            inputPos: 1,
          },
          estimatedGas: '50000',
        },
      ],
    });

    console.log('router', 'rest');
    console.log(route, rest);

    // Execute the swap transaction
    const tx = (await squid.current.executeRoute({
      signer: provider.getSigner(),
      route,
    })) as unknown as TransactionResponse;

    console.log('tx');
    console.log(tx);

    const txReceipt = await tx.wait();
    console.log('txReceipt');
    console.log(txReceipt);
  };

  return (
    <>
      {account && pubKey ? (
        <>
          <p>{account}</p>
          <p>{pubKey}</p>
        </>
      ) : (
        <div>
          <button onClick={openDialog}>Connect</button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="flex flex-col gap-4"
      >
        <div>
          <label>From chain</label>
          <select
            name="chain"
            className="p-1 border w-full"
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
          >
            {chains?.map((c) => (
              <option key={c.chainId} value={c.chainId}>
                {c.networkName} ({c.chainId})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>From token</label>
          <select name="token" className="p-1 border w-full">
            {tokens
              ?.filter((t) => t.chainId.toString() === fromChain?.toString())
              .map((t, i) => (
                <option key={t.address} value={t.address}>
                  {t.name} ({t.address})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label>Amount</label>
          <input
            name="amount"
            type="text"
            className="p-1 border w-full"
            defaultValue="1000000000000000000"
          />
        </div>
        <TradingButton type="submit">Submit</TradingButton>
      </form>
    </>
  );
};
