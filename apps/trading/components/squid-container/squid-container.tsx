import debounce from 'lodash/debounce';
import { Squid } from '@0xsquid/sdk';
import {
  type ChainData,
  type Token,
  type TransactionResponse,
  type RouteRequest,
  type RouteResponse,
  type SquidError,
  ChainType,
  SquidCallType,
} from '@0xsquid/sdk/dist/types';
import compact from 'lodash/compact';
import {
  ERC20_ABI,
  BRIDGE_ARBITRUM_ABI,
  BRIDGE_ABI,
} from '@vegaprotocol/smart-contracts';
import { ethers } from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type AssetFieldsFragment,
  useAssetsDataProvider,
} from '@vegaprotocol/assets';
import { useEthereumConfig } from '@vegaprotocol/web3';
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
import { removeDecimal, useRequired } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

interface SquidResponseError {
  code: string;
  config: object;
  message: string;
  response: {
    config: object;
    data: {
      errors: Array<SquidError>;
    };
  };
}

const BRIDGES: { [C in ToChains]: string } = {
  '1': '0x23872549cE10B40e31D6577e0A920088B0E0666a',
  // TODO: get from API when available
  '42161': '0xd459fac6647059100ebe45543e1da73b3b70ffba',
};

const TO_CHAINS = ['1', '42161'] as const;

type ToChains = typeof TO_CHAINS[number];

// eslint-disable-next-line
const BRIDGE_ABIS: { [C in ToChains]: any } = {
  '1': BRIDGE_ABI,
  '42161': BRIDGE_ARBITRUM_ABI,
};

export const SquidContainer = () => {
  const { SQUID_INTEGRATOR_ID, SQUID_API_URL } = useEnvironment();
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
      assets={assets}
      // TODO: revert to using this
      // bridgeAddress={config.collateral_bridge_contract.address}
    />
  );
};

type TxStatus = 'idle' | 'confirming' | 'pending' | 'complete';

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
  assets,
}: // bridgeAddress,
{
  apiUrl: string;
  integratorId: string;
  assets: AssetFieldsFragment[];
  // bridgeAddress: string;
}) => {
  const { pubKeys } = useVegaWallet();
  const { account, provider } = useWeb3React();
  // const openDialog = useWeb3ConnectStore((store) => store.open);

  const squid = useRef(
    new Squid({
      baseUrl: apiUrl,
      integratorId,
    })
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormFields>({
    defaultValues: {
      toKey: '1e619862533c319e5e22d1cf0414a07c354d98ebaca1dc0d5246205e1e26fe5c',
      fromChain: '42161',
      fromToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      toChain: '42161',
      toToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      amount: '1',
    },
  });
  const required = useRequired();

  // Squid state
  const [ready, setReady] = useState(false);
  const [chains, setChains] = useState<ChainData[]>([]);
  // all tokens across all chains
  const [tokens, setTokens] = useState<Token[]>([]);

  const [routeStatus, setRouteStatus] = useState<'idle' | 'fetching'>('idle');
  const [routeErr, setRouteErr] = useState<SquidResponseError>();
  const [routeResponse, setRouteResponse] = useState<RouteResponse>();

  const [tracking, setTracking] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  // eslint-disable-next-line
  const [tx, setTx] = useState<any>();
  // eslint-disable-next-line
  const [txReceipt, setTxReceipt] = useState<any>();

  // We need to watch all fields to refetch (debounced) the route if anything changes
  const toKey = useWatch({ name: 'toKey', control });
  const fromChain = useWatch({ name: 'fromChain', control });
  const fromToken = useWatch({ name: 'fromToken', control });
  const toChain = useWatch({ name: 'toChain', control });
  const toToken = useWatch({ name: 'toToken', control });
  const amount = useWatch({ name: 'amount', control });

  const isSameChain = fromChain === toChain;
  const isSameToken = fromToken === toToken;
  const noSwap = isSameChain && isSameToken;

  useEffect(() => {
    const run = async () => {
      await squid.current.init();
      setChains(squid.current.chains);
      setTokens(squid.current.tokens);
      setReady(true);
    };

    run();
  }, []);

  const getRoute = useMemo(
    () =>
      // TODO: fix any race conditions during route fetch
      debounce(async (fields: FormFields) => {
        if (!provider) return;
        if (!account) return;
        if (!tokens.length) return;
        if (!squid.current) return;
        if (!account) return;

        if (!fields.toKey) return;
        if (!fields.fromChain) return;
        if (!fields.fromToken) return;
        if (!fields.toChain) return;
        if (!fields.toToken) return;
        if (!fields.amount) return;

        if (fields.fromToken === fields.toToken) return;

        const fromToken = tokens.find((t) => t.address === fields.fromToken);
        const toToken = tokens.find((t) => t.address === fields.toToken);

        if (!fromToken) {
          throw new Error(`No fromToken ${fields.fromToken} found`);
        }
        if (!toToken) {
          throw new Error(`No toToken ${fields.toToken} found`);
        }

        const bridgeAddress = BRIDGES[fields.toChain as ToChains];

        if (!bridgeAddress) {
          throw new Error(`No bridge for chain: ${fields.toChain}`);
        }

        const bridgeAbi = BRIDGE_ABIS[fields.toChain as ToChains];

        if (!bridgeAbi) {
          throw new Error(`No bridge abi for ${fields.fromChain}`);
        }

        const tokenContract = new ethers.Contract(
          fields.toToken,
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

        const method = fields.toChain === '42161' ? 'deposit' : 'deposit_asset';

        const args =
          fields.toChain === '42161'
            ? [fields.toToken, 0, '0x' + fields.toKey, account] // Arbitrum bridge requries a 4th argument for the recover account address
            : [fields.toToken, 0, '0x' + fields.toKey];

        const depositEncodedData = bridgeContract.interface.encodeFunctionData(
          method,
          args
        );

        const routeConfig: RouteRequest = {
          fromChain: fields.fromChain,
          fromToken: fields.fromToken,
          fromAmount: removeDecimal(fields.amount, fromToken.decimals),
          toChain: fields.toChain,
          toToken: fields.toToken,
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
                target: fields.toToken,
                value: '0',
                callData: approveEncodeData,
                payload: {
                  tokenAddress: fields.toToken,
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
                  tokenAddress: fields.toToken,
                  inputPos: 1,
                },
                estimatedGas: '50000',
              },
            ],
          },
        };

        try {
          setRouteErr(undefined);
          setRouteResponse(undefined);
          setRouteStatus('fetching');
          const routeResponse = await squid.current.getRoute(routeConfig);
          setRouteResponse(routeResponse);
        } catch (err) {
          setRouteErr(err as SquidResponseError);
        } finally {
          setRouteStatus('idle');
        }
      }, 1000),
    [provider, tokens, account]
  );

  useEffect(() => {
    getRoute({ toKey, fromChain, fromToken, toChain, toToken, amount });
  }, [
    getRoute,
    isValid,
    toKey,
    fromChain,
    fromToken,
    toChain,
    toToken,
    amount,
  ]);

  const onSubmit = async (fields: FormFields) => {
    if (!provider) {
      throw new Error('No provider');
    }

    // No swap needed if same chain and token
    if (noSwap) {
      const chain = fields.fromChain;
      const token = fields.fromToken;

      const bridgeAddress = BRIDGES[chain as ToChains];
      const bridgeAbi = BRIDGE_ABIS[chain as ToChains];

      if (!bridgeAddress) {
        throw new Error(`No bridge for chain: ${fields.toChain}`);
      }

      if (!bridgeAbi) {
        throw new Error(`No bridge abi for ${fields.fromChain}`);
      }

      const bridgeContract = new ethers.Contract(
        bridgeAddress,
        bridgeAbi,
        provider.getSigner()
      );

      const method = chain === '42161' ? 'deposit' : 'deposit_asset';

      const args =
        chain === '42161'
          ? [token, 0, '0x' + fields.toKey, account] // Arbitrum bridge requries a 4th argument for the recover account address
          : [token, 0, '0x' + fields.toKey];

      try {
        setTxReceipt(undefined);
        setTxStatus('confirming');

        const tx = await bridgeContract[method](...args);
        // eslint-disable-next-line
        console.log(tx);
        setTx(tx);
        setTxStatus('pending');

        const receipt = await tx.wait();
        // eslint-disable-next-line
        console.log(receipt);
        setTxReceipt(receipt);
        setTxStatus('complete');
      } catch (err) {
        if (
          err instanceof Error &&
          'code' in err &&
          err.code === 'ACTION_REJECTED'
        ) {
          setTxStatus('idle');
        } else {
          console.error(err);
        }
      }

      return;
    }

    if (!routeResponse) {
      throw new Error('No route response');
    }

    try {
      setTxReceipt(undefined);
      setTxStatus('confirming');

      const tx = (await squid.current.executeRoute({
        signer: provider.getSigner(),
        route: routeResponse.route,
      })) as unknown as TransactionResponse;

      // eslint-disable-next-line
      console.log(tx);
      setTx(tx);
      setTxStatus('pending');

      const receipt = await tx.wait();
      // eslint-disable-next-line
      console.log(receipt);
      setTxReceipt(receipt);
      setTxStatus('complete');
    } catch (err) {
      if (
        err instanceof Error &&
        'code' in err &&
        err.code === 'ACTION_REJECTED'
      ) {
        setTxStatus('idle');
      } else {
        console.error(err);
      }
    }
  };

  if (!ready) {
    return <div>Loading</div>;
  }

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
    <>
      {tracking && (
        <TxOverlay
          status={txStatus}
          tx={tx}
          receipt={txReceipt}
          onCancel={() => {
            setTxStatus('idle');
            setTracking(false);
          }}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        {routeErr && (
          <div className="text-sm text-danger">
            {isSquidError(routeErr) ? (
              <div>
                <p>Route failed</p>
                {routeErr.response.data.errors.map((e, i) => {
                  return (
                    <p key={i} className="text-xs">
                      {e.errorType} {e.message} {e.reason}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p>Route failed</p>
            )}
          </div>
        )}
        <FormGroup label="To key" labelFor="toKey">
          <TradingSelect {...register('toKey', { validate: { required } })}>
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
          <TradingSelect {...register('fromChain', { validate: { required } })}>
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
          <TradingSelect {...register('fromToken', { validate: { required } })}>
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
          <TradingSelect {...register('toChain', { validate: { required } })}>
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
          <TradingSelect {...register('toToken', { validate: { required } })}>
            {tokens
              ?.filter((t) => {
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
          {!noSwap && routeResponse && routeStatus !== 'fetching' && (
            <ConvertedAmount
              tokens={tokens}
              toToken={toToken}
              amount={amount}
              exchangeRate={routeResponse.route.estimate.exchangeRate}
            />
          )}
        </FormGroup>
        {!noSwap && routeResponse && routeStatus !== 'fetching' && (
          <RouteDetails routeResponse={routeResponse} />
        )}
        <TradingButton
          type="submit"
          disabled={
            !noSwap &&
            (routeStatus === 'fetching' || routeResponse === undefined)
          }
          fill={true}
        >
          {routeStatus === 'fetching'
            ? 'Fetching route...'
            : 'Swap and deposit'}
        </TradingButton>
        {txStatus !== 'idle' && (
          <div className="flex flex-col items-center pt-2 text-sm">
            <p>
              {txStatus === 'confirming'
                ? 'Confirm in wallet...'
                : 'Transaction sent!'}
            </p>
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => setTracking(true)}
            >
              View details
            </button>
          </div>
        )}
      </form>
    </>
  );
};

const ConvertedAmount = ({
  tokens,
  toToken,
  amount,
  exchangeRate,
}: {
  tokens: Token[];
  toToken: string;
  amount: string;
  exchangeRate: string;
}) => {
  const to = tokens.find((t) => t.address === toToken);
  if (!to) return null;

  const value = new BigNumber(amount);

  return (
    <div className="flex justify-end text-muted text-xs pt-1">
      {value.isGreaterThan(0)
        ? `${value.times(exchangeRate).toString()} ${to.symbol}`
        : `0 ${to.symbol}`}
    </div>
  );
};

const RouteDetails = ({ routeResponse }: { routeResponse: RouteResponse }) => {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <div>
        <h3>Details</h3>
        <dl className="text-xs">
          <div className="flex justify-between">
            <dt>Agg. price impact</dt>
            <dd>{routeResponse.route.estimate.aggregatePriceImpact}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Agg. slippage</dt>
            <dd>
              {
                // @ts-expect-error not on type
                routeResponse.route.estimate.aggregateSlippage
              }
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Exchange rate</dt>
            <dd>{routeResponse.route.estimate.exchangeRate}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h3>Swap route</h3>
        <ul className="text-xs">
          {routeResponse.route.estimate.actions.map((a, i) => {
            if (!a) return null;
            return (
              <li key={i} className="flex justify-between gap-2">
                <p>{a.description}</p>
                {a.priceImpact && (
                  <p className="text-muted">Price impact: {a.priceImpact}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const TxOverlay = ({
  status,
  tx,
  receipt,
  onCancel,
}: {
  status: TxStatus;
  // eslint-disable-next-line
  tx: any;
  // eslint-disable-next-line
  receipt: any;
  onCancel: () => void;
}) => {
  let content = null;

  if (status === 'idle') return null;

  if (status === 'confirming') {
    content = <span>Confirm in wallet...</span>;
  } else if (status === 'pending') {
    content = <span>Awaiting transaction...</span>;
  } else if (status === 'complete') {
    content = <span>Complete</span>;
  }

  return (
    <div className="flex flex-col gap-2 absolute top-0 left-0 w-full h-full bg-white dark:bg-black p-2 text-sm z-20">
      <div>
        <button className="underline underline-offset-4" onClick={onCancel}>
          Back
        </button>
      </div>
      <div>
        <p>{content}</p>
      </div>
      {tx && (
        <div>
          <p>Tx hash: {tx.hash}</p>
        </div>
      )}
      {receipt && <pre>{JSON.stringify(receipt, null, 2)}</pre>}
    </div>
  );
};

const isSquidError = (err: unknown): err is SquidResponseError => {
  if (err !== null && typeof err === 'object' && 'response' in err) {
    return true;
  }

  return false;
};
