import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { type Configs, depositSchema, type FormFields } from './deposit-form';
import { ChainType } from '@0xsquid/squid-types';
import {
  ArbitrumSquidReceiver,
  CollateralBridge,
  prepend0x,
  Token,
} from '@vegaprotocol/smart-contracts';
import { MIN, removeDecimal } from '@vegaprotocol/utils';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { useEthersSigner } from './use-ethers-signer';
import { ARBITRUM_SQUID_RECEIVER_ADDRESS } from './constants';
import { useQuery } from '@tanstack/react-query';
import { useSquid } from './use-squid';

export const useSquidRoute = ({
  form,
  assets,
  configs,
  enabled = false,
}: {
  form: UseFormReturn<FormFields>;
  assets: AssetERC20[] | undefined;
  configs: Configs;
  enabled?: boolean;
}) => {
  const [queryKey, setQueryKey] = useState<Partial<FormFields>>({});
  const signer = useEthersSigner();
  const { data: squid } = useSquid();

  // List to changes to all fields (debounced) and store into some state
  // that we can use as the query key for the route
  useEffect(() => {
    const callback = debounce((fields) => {
      setQueryKey(fields);
    }, 1000);
    const subscription = form.watch((x) => callback(x));
    return () => subscription.unsubscribe();
  }, [form]);

  const queryResult = useQuery({
    staleTime: MIN * 1,
    queryKey: ['squidRoute', queryKey],
    enabled: enabled && Boolean(queryKey),
    queryFn: async ({ queryKey }) => {
      const queryKeyRes = depositSchema.safeParse(queryKey[1]);

      if (!queryKeyRes.success) return null;
      if (!squid) return null;

      const fields = queryKeyRes.data;

      const fromAsset = squid.tokens.find(
        (t) => t.address === fields.fromAsset && t.chainId === fields.fromChain
      );
      const toAsset = assets?.find((a) => a.id === fields.toAsset);

      if (!fromAsset) return null;
      if (!toAsset) return null;

      const config = configs.find((c) => c.chain_id === toAsset.source.chainId);

      if (!config) return null;
      if (!signer) return null;

      // The default bridgeAddress for the selected toAsset if an arbitrum
      // to asset is selected will get changed to the squid receiver address
      let bridgeAddress = config.collateral_bridge_contract
        .address as `0x${string}`;

      const fromAmount = removeDecimal(fields.amount, fromAsset.decimals);
      const tokenContract = new Token(toAsset.source.contractAddress, signer);

      let approveCallData;
      let depositCallData;

      if (toAsset.source.chainId === '42161') {
        bridgeAddress = ARBITRUM_SQUID_RECEIVER_ADDRESS;
        // its arbitrum, use the arbitrum squid receiver contract
        approveCallData = tokenContract.encodeApproveData(
          bridgeAddress,
          fromAmount
        );
        const contract = new ArbitrumSquidReceiver(bridgeAddress);
        depositCallData = contract.encodeDepositData(
          toAsset.source.contractAddress,
          '0',
          prepend0x(fields.toPubKey),
          fields.fromAddress
        );
      } else {
        approveCallData = tokenContract.encodeApproveData(
          bridgeAddress,
          fromAmount
        );
        const contract = new CollateralBridge(bridgeAddress, signer);
        depositCallData = contract.encodeDepositData(
          toAsset.source.contractAddress,
          '0',
          prepend0x(fields.toPubKey)
        );
      }

      const result = await squid.getRoute({
        fromAddress: fields.fromAddress as `0x${string}`,
        fromChain: fields.fromChain,
        fromToken: fields.fromAsset,
        fromAmount,
        toChain: toAsset.source.chainId,
        toToken: toAsset.source.contractAddress,
        toAddress: fields.fromAddress as `0x${string}`,
        // @ts-ignore invalid types from squid
        slippageConfig: {
          autoMode: 1,
        },
        quoteOnly: false,
        enableBoost: true,
        postHook: {
          chainType: ChainType.EVM,
          calls: [
            {
              chainType: ChainType.EVM,
              callType: 1, // SquidCallType.FULL_TOKEN_BALANCE
              target: toAsset.source.contractAddress as `0x${string}`,
              value: '0', // this will be replaced by the full native balance of the multicall after the swap
              callData: approveCallData,
              payload: {
                tokenAddress: toAsset.source.contractAddress as `0x${string}`,
                inputPos: 1,
              },
              estimatedGas: '50000',
            },
            {
              chainType: ChainType.EVM,
              callType: 1, // SquidCallType.FULL_TOKEN_BALANCE
              target: ARBITRUM_SQUID_RECEIVER_ADDRESS,
              value: '0',
              callData: depositCallData,
              payload: {
                tokenAddress: toAsset.source.contractAddress as `0x${string}`,
                inputPos: 1,
              },
              estimatedGas: '50000',
            },
          ],
          description: 'Swap and deposit',
          logoURI: 'https://v2.app.squidrouter.com/images/icons/squid_logo.svg',
          provider: fields.fromAddress,
        },
      });

      return result;
    },
  });

  return queryResult;
};
