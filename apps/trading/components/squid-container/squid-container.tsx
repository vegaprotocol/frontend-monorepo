import { Squid } from '@0xsquid/sdk';
import {
  type ChainData,
  type Token,
  SquidCallType,
  TransactionResponse,
  ChainType,
  RouteRequest,
} from '@0xsquid/sdk/dist/types';
import compact from 'lodash/compact';
import {
  ERC20_ABI,
  BRIDGE_ARBITRUM_ABI,
  BRIDGE_ABI,
} from '@vegaprotocol/smart-contracts';
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import {
  type AssetFieldsFragment,
  useAssetsDataProvider,
} from '@vegaprotocol/assets';
import { useEthereumConfig, useWeb3ConnectStore } from '@vegaprotocol/web3';
import { AssetStatus } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEnvironment } from '@vegaprotocol/environment';
import { useWeb3React } from '@web3-react/core';
import {
  FormGroup,
  InputError,
  TradingButton,
  TradingInput,
  TradingSelect,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { useForm, useWatch } from 'react-hook-form';
import { useRequired } from '@vegaprotocol/utils';

const TO_CHAINS = ['1', '42161'] as const;

type ToChains = typeof TO_CHAINS[number];

// TODO: get from API when available
const BRIDGES: { [C in ToChains]: string } = {
  '1': '0x23872549cE10B40e31D6577e0A920088B0E0666a',
  '42161': '0xd459fac6647059100ebe45543e1da73b3b70ffba',
};

const BRIDGE_ABIS: { [C in ToChains]: any } = {
  '1': BRIDGE_ABI,
  '42161': BRIDGE_ARBITRUM_ABI,
};

export const SquidContainer = () => {
  const { SQUID_INTEGRATOR_ID, SQUID_API_URL } = useEnvironment();
  const { chainId } = useVegaWallet();
  const { data } = useAssetsDataProvider();
  const { config } = useEthereumConfig();
  const assets = compact(data).filter(
    (a) => a.status === AssetStatus.STATUS_ENABLED
  );

  if (!SQUID_INTEGRATOR_ID || !SQUID_API_URL) return <p>No integrator ID</p>;

  if (!config) return <p>No config</p>;

  if (!assets.length) return <p>No assets</p>;

  return (
    <SquidDeposit
      apiUrl={SQUID_API_URL}
      integratorId={SQUID_INTEGRATOR_ID}
      chainId={chainId}
      assets={assets}
      // bridgeAddress={config.collateral_bridge_contract.address}
    />
  );
};

interface FormFields {
  toKey: string;
  fromChain: string;
  fromToken: string;
  toChain: string;
  toToken: string;
  amount: string;
}

const SquidDeposit = ({
  apiUrl,
  integratorId,
  chainId,
  assets,
}: {
  apiUrl: string;
  integratorId: string;
  chainId: string;
  assets: AssetFieldsFragment[];
}) => {
  const { pubKeys } = useVegaWallet();
  const { account, provider } = useWeb3React();
  const openDialog = useWeb3ConnectStore((store) => store.open);

  const squid = useRef(
    new Squid({
      baseUrl: 'https://v2.api.squidrouter.com',
      integratorId,
    })
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormFields>();
  const required = useRequired();

  const formRef = useRef<HTMLFormElement>(null);
  const [ready, setReady] = useState(false);
  const [chains, setChains] = useState<ChainData[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);

  const fromChain = useWatch({ name: 'fromChain', control });
  const toChain = useWatch({ name: 'toChain', control });

  useEffect(() => {
    const run = async () => {
      await squid.current.init();
      setReady(true);
      setChains(squid.current.chains);
      setTokens(squid.current.tokens);
      setValue('fromChain', '1');
      setValue('toChain', '1');
    };

    run();
  }, []);

  if (!ready) {
    return <div>Loading</div>;
  }

  const onSubmit = async (fields: FormFields) => {
    console.log(fields);

    if (!provider) return;
    if (!account) return;

    if (!formRef.current) return;
    if (!squid.current) return;

    if (!account) return;

    const bridgeAddress = BRIDGES[toChain as ToChains];

    if (!bridgeAddress) {
      throw new Error(`No bridge for chain: ${toChain}`);
    }

    const fromToken = tokens.find((t) => t.address === fields.fromToken);
    const toToken = tokens.find((t) => t.address === fields.toToken);

    if (!fromToken) {
      throw new Error(
        `No token ${fields.fromToken} for chain ${fields.fromChain}`
      );
    }

    if (!toToken) {
      throw new Error(
        `No to token ${fields.toToken} for chain ${fields.toChain}`
      );
    }

    const bridgeAbi = BRIDGE_ABIS[toChain as ToChains];

    if (!bridgeAbi) {
      throw new Error(`No bridge abi for ${fromChain}`);
    }

    const tokenContract = new ethers.Contract(
      toToken.address,
      ERC20_ABI,
      provider.getSigner()
    );

    const bridgeContract = new ethers.Contract(
      bridgeAddress,
      bridgeAbi,
      provider.getSigner()
    );

    const approveEncodeData = tokenContract.interface.encodeFunctionData(
      'approve',
      [bridgeAddress, 0]
    );

    const method = toChain === '42161' ? 'deposit' : 'deposit_asset';

    const args =
      toChain === '42161'
        ? [toToken.address, 0, '0x' + fields.toKey, account] // Arbitrum bridge requries a 4th argument for the recover account address
        : [toToken.address, 0, '0x' + fields.toKey];

    const depositEncodedData = bridgeContract.interface.encodeFunctionData(
      method,
      args
    );

    const routeConfig: RouteRequest = {
      fromChain,
      fromToken: fromToken.address,
      fromAmount: fields.amount,
      toChain,
      toToken: toToken.address,
      fromAddress: account,
      toAddress: account,
      slippageConfig: {
        autoMode: 1, // 1 is "normal" slippage.
      },
      // @ts-expect-error fundAmount and fundToken are not required for postHook
      postHook: {
        chainType: ChainType.EVM,
        description: 'Deposit to Vega bridge',
        calls: [
          {
            chainType: ChainType.EVM,
            callType: SquidCallType.FULL_TOKEN_BALANCE,
            target: toToken.address,
            value: '0',
            callData: approveEncodeData,
            payload: {
              tokenAddress: toToken.address,
              inputPos: 1,
            },
            estimatedGas: '5000',
          },
          {
            chainType: ChainType.EVM,
            callType: SquidCallType.FULL_TOKEN_BALANCE,
            target: bridgeAddress,
            value: '0',
            callData: depositEncodedData,
            payload: {
              tokenAddress: toToken.address,
              inputPos: 1,
            },
            estimatedGas: '50000',
          },
        ],
      },
    };

    const { route, ...rest } = await squid.current.getRoute(routeConfig);

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

  const availableTokens: { [C in ToChains]: string[] } = {
    '1': compact(
      assets
        .filter((a) => a.source.__typename === 'ERC20')
        .map((a) => {
          if (a.source.__typename !== 'ERC20') return null;
          return a.source.contractAddress;
        })
    ),
    // TODO: get these from API when available
    '42161': [
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // tether
      '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', // chainlink
    ],
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <FormGroup label="To key" labelFor="toKey">
        <TradingSelect {...(register('toKey'), { validate: { required } })}>
          {pubKeys?.map((p) => (
            <option key={p.publicKey} value={p.publicKey}>
              {p.name} ({truncateMiddle(p.publicKey)})
            </option>
          ))}
        </TradingSelect>
        {errors.toKey?.message && (
          <InputError>{errors.toKey.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label="From chain" labelFor="fromChain">
        <TradingSelect {...register('fromChain')}>
          {chains?.map((c) => (
            <option key={c.chainId} value={c.chainId}>
              {c.networkName} ({c.chainId})
            </option>
          ))}
        </TradingSelect>
        {errors.fromChain?.message && (
          <InputError>{errors.fromChain.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label="From token" labelFor="fromToken">
        <TradingSelect {...register('fromToken')}>
          {tokens
            ?.filter((t) => t.chainId.toString() === fromChain?.toString())
            .map((t) => (
              <option key={t.address} value={t.address}>
                {t.name} ({t.address})
              </option>
            ))}
        </TradingSelect>
        {errors.fromToken?.message && (
          <InputError>{errors.fromToken.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label="To chain" labelFor="toChain">
        <TradingSelect {...register('toChain')}>
          {chains
            ?.filter((c) => TO_CHAINS.includes(c.chainId as ToChains))
            .map((c) => (
              <option key={c.chainId} value={c.chainId}>
                {c.networkName} ({c.chainId})
              </option>
            ))}
        </TradingSelect>
        {errors.toChain?.message && (
          <InputError>{errors.toChain.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label={'To token'} labelFor="toToken">
        <TradingSelect {...register('toToken')}>
          {tokens
            ?.filter((t) => {
              console.log(t, toChain, availableTokens);
              if (!toChain) return false;

              const tokensForChain = availableTokens[toChain as ToChains];

              if (tokensForChain.includes(t.address)) {
                return true;
              }

              return false;
            })
            .map((t) => (
              <option key={t.address} value={t.address}>
                {t.name} ({t.address})
              </option>
            ))}
        </TradingSelect>
        {errors.toToken?.message && (
          <InputError>{errors.toToken.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label="Amount" labelFor="amount">
        <TradingInput {...register('amount', { validate: { required } })} />
        {errors.amount?.message && (
          <InputError>{errors.amount.message}</InputError>
        )}
      </FormGroup>
      <TradingButton type="submit">Submit</TradingButton>
    </form>
  );
};
