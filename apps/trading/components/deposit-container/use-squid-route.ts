import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { ChainType } from '@0xsquid/squid-types';
import {
  ARBITRUM_SQUID_RECEIVER_ABI,
  BRIDGE_ABI,
  prepend0x,
} from '@vegaprotocol/smart-contracts';
import { removeDecimal } from '@vegaprotocol/utils';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { useQuery } from '@tanstack/react-query';
import { useSquid } from './use-squid';
import { type FormFields, type Configs, formSchema } from './form-schema';
import { encodeFunctionData } from 'viem';
import { getErc20Abi } from 'apps/trading/lib/utils/get-erc20-abi';
import {
  type Address,
  ARBITRUM_CHAIN_ID,
  ARBITRUM_SQUID_RECEIVER_ADDRESS,
} from './constants';
import { useT } from '../../lib/use-t';

/**
 * Whenever the form changes use the squid sdk to fetch the swap route object
 * which is needed to execute the swap. Form changes are debounced to avoid overfetching
 */
export const useSquidRoute = ({
  form,
  toAsset,
  configs,
  enabled = false,
}: {
  form: UseFormReturn<FormFields>;
  toAsset?: AssetERC20;
  configs: Configs;
  enabled?: boolean;
}) => {
  const t = useT();
  const [queryKey, setQueryKey] = useState<FormFields>();
  const { data: squid } = useSquid();

  // List to changes to all fields (debounced) and store into some state
  // that we can use as the query key for the route
  useEffect(() => {
    const callback = debounce((fields) => {
      // Check against the schema so that the queryKey is not set if the form
      // is invalid, therefore avoiding a failed fetch attempt for a swap route
      if (formSchema.safeParse(fields).success) {
        setQueryKey(fields);
      } else {
        setQueryKey(undefined);
      }
    }, 700);

    const subscription = form.watch((x) => callback(x));

    return () => subscription.unsubscribe();
  }, [form]);

  const queryResult = useQuery({
    queryKey: ['squidRoute', queryKey],
    enabled: enabled && Boolean(queryKey),
    queryFn: async ({ queryKey }) => {
      const queryKeyRes = formSchema.safeParse(queryKey[1]);
      if (!queryKeyRes.success) return null;
      if (!squid) return null;

      const fields = queryKeyRes.data;

      const fromAsset = squid.tokens.find(
        (t) => t.address === fields.fromAsset && t.chainId === fields.fromChain
      );

      if (!fromAsset) return null;
      if (!toAsset) return null;

      // From token and to token are the same, not a valid swap
      if (
        fromAsset.address.toLowerCase() ===
        toAsset.source.contractAddress.toLowerCase()
      ) {
        return null;
      }

      const config = configs.find((c) => c.chain_id === toAsset.source.chainId);

      if (!config) return null;

      const fromAmount = removeDecimal(fields.amount, fromAsset.decimals);

      // The default bridgeAddress for the selected toAsset if an arbitrum
      // to asset is selected will get changed to the squid receiver address
      let bridgeAddress = config.collateral_bridge_contract.address as Address;
      let approveCallData;
      let depositCallData;

      // Squid cannot guarantee that the funds will make it to the end desitination
      // so there is a squid reciever contarct we should use if we are making a swap
      // into an arbitrum asset
      //
      // TODO: there will in future be an ethereum squid receiver contract. We will
      // need to ensure that contracts is used if making a swap to an Ethereum token
      if (toAsset.source.chainId === ARBITRUM_CHAIN_ID) {
        bridgeAddress = ARBITRUM_SQUID_RECEIVER_ADDRESS;
        approveCallData = encodeFunctionData({
          abi: getErc20Abi({
            address: toAsset.source.contractAddress,
          }),
          functionName: 'approve',
          args: [bridgeAddress, BigInt(fromAmount)],
        });

        // NOTE that the squid receiver deposit contract takes a 4th argument which is the recovery
        // address if squid is unable to fulfill the swap
        depositCallData = encodeFunctionData({
          abi: ARBITRUM_SQUID_RECEIVER_ABI,
          functionName: 'deposit',
          args: [
            toAsset.source.contractAddress,
            '0',
            prepend0x(fields.toPubKey),
            fields.fromAddress,
          ],
        });
      } else {
        approveCallData = encodeFunctionData({
          abi: getErc20Abi({
            address: toAsset.source.contractAddress,
          }),
          functionName: 'approve',
          args: [bridgeAddress, BigInt(fromAmount)],
        });
        depositCallData = encodeFunctionData({
          abi: BRIDGE_ABI,
          functionName: 'deposit_asset',
          args: [
            toAsset.source.contractAddress,
            '0',
            prepend0x(fields.toPubKey),
          ],
        });
      }

      const result = await squid.getRoute({
        fromAddress: fields.fromAddress,
        fromChain: fields.fromChain,
        fromToken: fields.fromAsset,
        fromAmount,
        toChain: toAsset.source.chainId,
        toToken: toAsset.source.contractAddress,
        toAddress: fields.fromAddress,
        quoteOnly: false,
        enableBoost: true,
        postHook: {
          chainType: ChainType.EVM,
          calls: [
            {
              chainType: ChainType.EVM,
              callType: 1, // SquidCallType.FULL_TOKEN_BALANCE
              target: toAsset.source.contractAddress,
              value: '0', // this will be replaced by the full native balance of the multicall after the swap
              callData: approveCallData,
              payload: {
                tokenAddress: toAsset.source.contractAddress,
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
                tokenAddress: toAsset.source.contractAddress,
                inputPos: 1,
              },
              estimatedGas: '50000',
            },
          ],
          description: t('Swap and deposit'),
          logoURI: 'https://v2.app.squidrouter.com/images/icons/squid_logo.svg',
          provider: fields.fromAddress,
        },
      });

      return result;
    },
  });

  return queryResult;
};
