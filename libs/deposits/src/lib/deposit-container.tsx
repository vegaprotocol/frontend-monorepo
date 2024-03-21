import { ChainData, TokenData, Squid, SquidCallType } from '@0xsquid/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
// import { ChainData, Token } from '@0xsquid/squid-types';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { FormEvent, useEffect, useRef, useState } from 'react';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: { assetId?: string }) => {
  const { account, provider } = useWeb3React();
  const squid = useRef(
    new Squid({
      // baseUrl: 'https://testnet.v2.api.squidrouter.com',
      baseUrl: 'https://testnet.api.squidrouter.com',
      integratorId: 'vega-swap-widget',
    })
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [ready, setready] = useState(false);
  const [chains, setChains] = useState<ChainData[]>();
  const [tokens, setTokens] = useState<TokenData[]>();

  const [fromChain, setFromChain] = useState<string>();

  useEffect(() => {
    const run = async () => {
      await squid.current.init();
      console.log('squid inited');
      console.log(squid);
      setready(true);

      setChains(squid.current.chains);
      setTokens(squid.current.tokens);
    };

    run();
  }, []);

  if (!ready) {
    return <div>Loading</div>;
  }

  console.log(chains, tokens);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!provider) return;

    if (!formRef.current) return;
    if (!squid.current) return;

    if (!account) {
      alert('Connect wallet');
      return;
    }

    const formData = new FormData(formRef.current);
    console.log(formData);

    const fromChain = formData.get('chain')?.toString();
    const fromToken = formData.get('token')?.toString();
    const fromAmount = formData.get('amount')?.toString();

    if (!fromChain) return;
    if (!fromToken) return;
    if (!fromAmount) return;

    const { route } = await squid.current.getRoute({
      fromChain,
      fromAmount,
      fromToken,
      toChain: '11155111', // Sepolia
      toToken: '0x254d06f33bDc5b8ee05b2ea472107E300226659A', // aUSDC on sepolia
      fromAddress: account,
      toAddress: '',
      slippage: 1,
      // TODO: customContractCAlls to send your new axlUSDC to the bridge
      // customContractCalls: [
      //   {
      //     callType: SquidCallType.FULL_TOKEN_BALANCE,
      //     target: '',
      //     value: '',
      //     callData: '',
      //     payload: {
      //       tokenAddress: '',
      //       inputPos: 1,
      //     },
      //     estimatedGas: '5000',
      //   },
      // ],
    });

    // Execute the swap transaction
    const tx = (await squid.current.executeRoute({
      signer: provider.getSigner(),
      route,
    })) as unknown as TransactionResponse;

    const txReceipt = await tx.wait();
    console.log(txReceipt);
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col gap-4">
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
            ?.filter((t) => t.chainId === fromChain)
            .map((t) => (
              <option key={t.interchainTokenId} value={t.interchainTokenId}>
                {t.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label>Amount</label>
        <input name="amount" type="text" className="p-1 border w-full" />
      </div>
      <TradingButton type="submit">Submit</TradingButton>
    </form>
  );
};
