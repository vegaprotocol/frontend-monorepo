import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DepositGetStarted } from './deposit-get-started';
import {
  useAssetDetailsDialogStore,
  useEnabledAssets,
} from '@vegaprotocol/assets';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  addDecimal,
  isAssetTypeERC20,
  removeDecimal,
  truncateByChars,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Intent,
  TokenIcon,
  TradingButton,
  TradingInput,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import {
  EthTxStatus,
  useEthereumConfig,
  useEthTransactionStore,
  useWeb3ConnectStore,
} from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import {
  CollateralBridge,
  prepend0x,
  Token,
} from '@vegaprotocol/smart-contracts';
import { MaxUint256 } from '@ethersproject/constants';
import { useTopTradedMarkets } from '../../lib/hooks/use-top-traded-markets';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { getAsset } from '@vegaprotocol/markets';
import classNames from 'classnames';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { Markets } from './markets';
import { Balance } from './balance';
import { Allowance } from './allowance';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Faucet } from './faucet';
import { AssetSelect } from './asset-select';

export const Deposit = () => {
  const { VEGA_ENV } = useEnvironment();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const { data: assets } = useEnabledAssets();
  const { data: markets } = useTopTradedMarkets();
  const { config } = useEthereumConfig();

  if (!assets) return null;
  if (!config) return null;

  return (
    <div className="flex">
      <div className="flex flex-col w-2/3 gap-4">
        <DepositFlow
          assets={assets}
          assetId={assetId}
          bridgeAddress={config.collateral_bridge_contract.address}
          confirmations={config.confirmations}
          markets={markets || []}
          faucetEnabled={VEGA_ENV !== Networks.MAINNET}
        />
        <DepositGetStarted />
      </div>
    </div>
  );
};

export const getMarketsForAsset = (
  markets: MarketMaybeWithDataAndCandles[],
  asset: AssetFieldsFragment
) => {
  return markets
    .filter((m) => {
      const marketAsset = getAsset(m);
      return marketAsset.id === asset.id;
    })
    .slice(0, 4);
};

interface DepositState {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  allowance: BigNumber | undefined;
  balance: BigNumber | undefined;
  step: number;
}

type SetDepositState = Dispatch<SetStateAction<DepositState>>;

const DepositFlow = ({
  assets,
  assetId,
  bridgeAddress,
  confirmations,
  markets,
  faucetEnabled,
}: {
  assets: AssetFieldsFragment[];
  assetId?: string;
  bridgeAddress: string;
  confirmations: number;
  markets: MarketMaybeWithDataAndCandles[];
  faucetEnabled: boolean;
}) => {
  const { provider, account } = useWeb3React();
  const [state, setState] = useState<DepositState>(() => {
    const asset = assets.find((a) => a.id === assetId);
    return {
      asset,
      amount: '',
      allowance: undefined,
      balance: undefined,
      step: asset ? 1 : 0,
    };
  });

  const handleAssetChanged = useCallback(
    async (assetId?: string) => {
      const asset = assets.find((a) => a.id === assetId);

      if (!asset) {
        setState((curr) => ({
          ...curr,
          asset: undefined,
          allowance: undefined,
          balance: undefined,
          step: 0,
        }));
        return;
      }

      if (!isAssetTypeERC20(asset)) throw new Error('invalid asset');

      let allowance = new BigNumber(0);
      let balance = new BigNumber(0);

      // if you have connected and therefore have a provider get
      // balance and allowance
      if (provider && account) {
        const signer = provider.getSigner();
        const tokenContract = new Token(
          asset.source.contractAddress,
          signer || provider
        );
        const allowanceRes = await tokenContract.allowance(
          account,
          bridgeAddress
        );
        allowance = new BigNumber(
          addDecimal(allowanceRes.toString(), asset.decimals)
        );

        const balanceRes = await tokenContract.balanceOf(account);
        balance = new BigNumber(
          addDecimal(balanceRes.toString(), asset.decimals)
        );
      }

      setState((curr) => ({
        ...curr,
        asset,
        allowance,
        balance,
        step: isApproved(allowance) ? 2 : 1,
      }));
    },
    [account, assets, bridgeAddress, provider]
  );

  const refetchBalances = useCallback(() => {
    // refetch balance and allowance
    if (state.asset) {
      handleAssetChanged(state.asset.id);
    }
  }, [state.asset, handleAssetChanged]);

  return (
    <div className="flex flex-col gap-4">
      <StepWrapper step={0} currentStep={state.step} title={'Select asset'}>
        <AssetSelect
          asset={state.asset}
          assets={assets}
          markets={markets}
          onSelect={handleAssetChanged}
        />
      </StepWrapper>
      <StepWrapper step={1} currentStep={state.step} title={'Approve'}>
        <Approval
          state={state}
          bridgeAddress={bridgeAddress}
          refetchBalances={refetchBalances}
        />
      </StepWrapper>
      <StepWrapper step={2} currentStep={state.step} title={'Deposit'}>
        <SendDeposit
          state={state}
          setState={setState}
          bridgeAddress={bridgeAddress}
          faucetEnabled={faucetEnabled}
          refetchBalances={refetchBalances}
          confirmations={confirmations}
        />
      </StepWrapper>
      {state.step === 3 && (
        <div className="flex gap-2">
          <TradingButton onClick={() => handleAssetChanged()}>
            {t('Deposit another asset')}
          </TradingButton>
          <TradingButton>{t('Start trading')}</TradingButton>
        </div>
      )}
    </div>
  );
};

const StepWrapper = ({
  children,
  step,
  currentStep,
  title,
}: {
  children: ReactNode;
  step: number;
  currentStep: number;
  title: string;
}) => {
  const complete = currentStep > step;
  const hidden = currentStep < step;
  return (
    <section className="flex flex-col gap-3">
      <h3
        className={classNames('flex gap-3', {
          'text-muted': hidden,
        })}
      >
        {complete ? (
          <span className="inline-block w-4 text-vega-green-600 dar:text-vega-green">
            <VegaIcon name={VegaIconNames.TICK} size={18} />
          </span>
        ) : (
          <span className="inline-block w-6 h-6 text-center rounded-full bg-vega-clight-600">
            {step + 1}
          </span>
        )}{' '}
        {title}
      </h3>
      {!hidden && <div className="pl-7">{children}</div>}
    </section>
  );
};

const DepositFlow2 = ({
  assets,
  assetId,
  bridgeAddress,
  confirmations,
  markets,
  faucetEnabled,
}: {
  assets: AssetFieldsFragment[];
  assetId?: string;
  bridgeAddress: string;
  confirmations: number;
  markets: MarketMaybeWithDataAndCandles[];
  faucetEnabled: boolean;
}) => {
  const [search, setSearch] = useState('');

  const { provider, account } = useWeb3React();

  const [state, setState] = useState<DepositState>(() => {
    const asset = assets.find((a) => a.id === assetId);
    return {
      asset,
      amount: '',
      allowance: undefined,
      balance: undefined,
      complete: false,
    };
  });

  const handleAssetChanged = useCallback(
    async (assetId?: string) => {
      const asset = assets.find((a) => a.id === assetId);

      if (!asset) {
        setState((curr) => ({
          ...curr,
          asset: undefined,
          allowance: undefined,
          balance: undefined,
        }));
        return;
      }

      if (!isAssetTypeERC20(asset)) throw new Error('invalid asset');

      let allowance = new BigNumber(0);
      let balance = new BigNumber(0);

      // if you have connected and therefore have a provider get
      // balance and allowance
      if (provider && account) {
        const signer = provider.getSigner();
        const tokenContract = new Token(
          asset.source.contractAddress,
          signer || provider
        );
        const allowanceRes = await tokenContract.allowance(
          account,
          bridgeAddress
        );
        allowance = new BigNumber(
          addDecimal(allowanceRes.toString(), asset.decimals)
        );

        const balanceRes = await tokenContract.balanceOf(account);
        balance = new BigNumber(
          addDecimal(balanceRes.toString(), asset.decimals)
        );
      }

      setState((curr) => ({
        ...curr,
        asset,
        allowance,
        balance,
      }));
    },
    [account, assets, bridgeAddress, provider]
  );

  const refetchBalances = useCallback(() => {
    // refetch balance and allowance
    if (state.asset) {
      handleAssetChanged(state.asset.id);
    }
  }, [state.asset, handleAssetChanged]);

  const filteredAssets = assets
    .filter((a) => a.source.__typename === 'ERC20')
    .filter((a) => a.symbol.toLowerCase().includes(search.toLowerCase()));
  filteredAssets.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  const isAssetSelected = state.asset && isAssetTypeERC20(state.asset);

  let step = 0;
  if (isAssetSelected) {
    if (!state.allowance || state.allowance.isLessThanOrEqualTo(0)) {
      step = 1;
    } else {
      step = 2;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <StepBreadcrumb step={step} />
        <div>
          {!isAssetSelected && (
            <TradingInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          )}
        </div>
      </div>
      {isAssetSelected ? (
        <AssetSelected
          state={state}
          setState={setState}
          markets={markets}
          confirmations={confirmations}
          bridgeAddress={bridgeAddress}
          faucetEnabled={faucetEnabled}
          onCancel={() => handleAssetChanged()}
          refetchBalances={refetchBalances}
        />
      ) : (
        <AssetList
          assets={filteredAssets}
          markets={markets}
          onSelect={handleAssetChanged}
        />
      )}
    </div>
  );
};

const AssetList = ({
  assets,
  markets,
  onSelect,
}: {
  assets: AssetFieldsFragment[];
  markets: MarketMaybeWithDataAndCandles[];
  onSelect: (assetId: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {assets.map((a) => {
        if (!isAssetTypeERC20(a)) return null;

        const marketsForAsset = getMarketsForAsset(markets, a);

        return (
          <div
            key={a.id}
            onClick={() => {
              onSelect(a.id);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSelect(a.id);
              }
            }}
            className={classNames(
              'p-5 rounded text-left',
              'bg-vega-clight-800 dark:bg-vega-cdark-800 hover:bg-vega-clight-700 dark:hover:bg-vega-cdark-700 cursor-pointer'
            )}
          >
            <div className="flex flex-col flex-1 gap-3">
              <div className="flex justify-between">
                <TokenHeader asset={a} />
                <div className="text-right">
                  <Balance asset={a} />
                </div>
              </div>
              <Markets markets={marketsForAsset} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AssetSelected = ({
  state,
  setState,
  markets,
  bridgeAddress,
  confirmations,
  faucetEnabled,
  refetchBalances,
  onCancel,
}: {
  state: DepositState;
  setState: SetDepositState;
  markets: MarketMaybeWithDataAndCandles[];
  bridgeAddress: string;
  confirmations: number;
  faucetEnabled: boolean;
  refetchBalances: () => void;
  onCancel: () => void;
}) => {
  if (!state.asset) {
    throw new Error('no asset selected');
  }

  return (
    <div
      className={classNames(
        'p-5 rounded flex flex-col gap-3',
        'bg-vega-clight-700 dark:bg-vega-cdark-700'
      )}
    >
      <div className="flex justify-between">
        <TokenHeader asset={state.asset} />
        <div className="text-right">
          <Balance asset={state.asset} balance={state.balance} />
        </div>
      </div>
      <Markets markets={getMarketsForAsset(markets, state.asset)} />
      <div className="relative">
        <TransactionContainer
          state={state}
          setState={setState}
          bridgeAddress={bridgeAddress}
          confirmations={confirmations}
          refetchBalances={refetchBalances}
          faucetEnabled={faucetEnabled}
          onCancel={onCancel}
        />
        <div className="absolute bottom-0 right-0">
          <TradingButton
            onClick={() => onCancel()}
            size="small"
            intent={Intent.Danger}
          >
            {t('Change asset')}
          </TradingButton>
        </div>
      </div>
    </div>
  );
};
const TransactionContainer = ({
  state,
  setState,
  bridgeAddress,
  confirmations,
  refetchBalances,
  faucetEnabled,
  onCancel,
}: {
  state: DepositState;
  setState: SetDepositState;
  bridgeAddress: string;
  confirmations: number;
  refetchBalances: () => void;
  faucetEnabled: boolean;
  onCancel: () => void;
}) => {
  return (
    <>
      <Approval
        state={state}
        bridgeAddress={bridgeAddress}
        refetchBalances={refetchBalances}
      />
      <SendDeposit
        state={state}
        bridgeAddress={bridgeAddress}
        confirmations={confirmations}
        setAmount={(amount) => setState((curr) => ({ ...curr, amount }))}
        faucetEnabled={faucetEnabled}
        refetchBalances={refetchBalances}
        onCancel={onCancel}
      />
    </>
  );
};

const Approval = ({
  state,
  bridgeAddress,
  refetchBalances,
}: {
  state: DepositState;
  bridgeAddress: string;
  refetchBalances: () => void;
}) => {
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { account, provider } = useWeb3React();
  const [id, setId] = useState<number | null>(null);

  const tx = useEthTransactionStore((store) => {
    return store.transactions.find((t) => t?.id == id);
  });
  const send = useEthTransactionStore((store) => store.create);

  const submitApproval = () => {
    if (!provider) throw new Error('no provider');
    if (!isAssetTypeERC20(state.asset)) {
      throw new Error('no provider');
    }
    const signer = provider.getSigner();
    const contract = new Token(
      state.asset.source.contractAddress,
      signer || provider
    );
    const id = send(contract, 'approve', [
      bridgeAddress,
      MaxUint256.toString(),
    ]);
    setId(id);
  };

  useEffect(() => {
    if (!state.asset) return; // this can get triggered when you clear the selected asset
    if (tx?.status === EthTxStatus.Confirmed) {
      refetchBalances();
    }
  }, [tx?.status, state.asset, refetchBalances]);

  if (!state.asset) return null;

  // No asset selected, show generic approval title
  if (!account) {
    return (
      <TradingButton onClick={openDialog} size="small">
        {t('Connect Ethereum wallet')}
      </TradingButton>
    );
  }

  return isApproved(state.allowance) ? (
    <div className="flex justify-between gap-2">
      <div>
        {tx && tx.status === EthTxStatus.Pending ? (
          <TradingButton disabled={true} size="small">
            {t('Approving...')}
          </TradingButton>
        ) : (
          <TradingButton onClick={submitApproval} size="small">
            {t('Re-approve')}
          </TradingButton>
        )}
      </div>
      <div>
        {state.allowance && (
          <div className="font-mono text-lg">
            <Allowance allowance={state.allowance} />
            <small className="ml-1 text-xs text-muted font-alpha">
              {t('Approved')}
            </small>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-start gap-1">
      <div>
        <p className="text-sm text-muted">
          {t(
            'Before you can make a deposit of %s you need to approve its use with Vega in your Ethereum wallet.',
            state.asset.symbol
          )}
        </p>
      </div>
      {tx && tx.status === EthTxStatus.Pending ? (
        <TradingButton intent={Intent.Success} disabled={true} size="small">
          {t('Approving...')}
        </TradingButton>
      ) : (
        <TradingButton
          onClick={submitApproval}
          size="small"
          intent={Intent.Success}
        >
          {t('Approve %s deposits', state.asset.symbol)}
        </TradingButton>
      )}
    </div>
  );
};

const SendDeposit = ({
  state,
  setState,
  bridgeAddress,
  confirmations,
  faucetEnabled,
  refetchBalances,
}: {
  state: DepositState;
  setState: SetDepositState;
  bridgeAddress: string;
  confirmations: number;
  faucetEnabled: boolean;
  refetchBalances: () => void;
}) => {
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { pubKey } = useVegaWallet();
  const { provider, account } = useWeb3React();

  const [id, setId] = useState<number | null>(null);
  const send = useEthTransactionStore((store) => store.create);
  const tx = useEthTransactionStore((store) => {
    return store.transactions.find((t) => t?.id == id);
  });

  const submitDeposit = async (e: FormEvent) => {
    e.preventDefault();
    if (!provider) {
      throw new Error('no provider');
    }
    if (!pubKey) {
      throw new Error('no vega pubkey');
    }
    if (!isAssetTypeERC20(state.asset)) {
      throw new Error('no asset selected');
    }
    const signer = provider.getSigner();
    const contract = new CollateralBridge(bridgeAddress, signer || provider);
    const id = send(
      contract,
      'deposit_asset',
      [
        state.asset.source.contractAddress,
        removeDecimal(state.amount, state.asset.decimals),
        prepend0x(pubKey),
      ],
      state.asset.id,
      confirmations ?? 1,
      true
    );
    setId(id);
  };

  useEffect(() => {
    if (!state.asset) return; // this can get triggered when you clear the selected asset
    if (tx?.status === EthTxStatus.Confirmed) {
      refetchBalances();
      setId(null);
      setState((curr) => ({ ...curr, step: 3 }));
    }
  }, [tx?.status, state.asset, setState, refetchBalances]);

  if (!state.asset) {
    return null;
  }

  if (!account) {
    return null;
  }

  // Dont show deposit ui unless approved
  if (!isApproved(state.allowance)) {
    return null;
  }

  if (!pubKey) {
    return (
      <TradingButton onClick={openVegaWalletDialog} size="small">
        {t('Connect Vega wallet')}
      </TradingButton>
    );
  }

  return (
    <form className="flex flex-col items-start gap-2" onSubmit={submitDeposit}>
      <div className="flex self-stretch gap-1 ">
        <div className="flex-1">
          <TradingInput
            name="amount"
            value={state.amount}
            onChange={(e) =>
              setState((curr) => ({ ...curr, amount: e.target.value }))
            }
            placeholder="Enter amount"
          />
        </div>
        {state.balance && (
          <TradingButton
            size="small"
            onClick={() => {
              setState((curr) => ({
                ...curr,
                amount: state.balance ? state.balance.toString() : '',
              }));
            }}
          >
            <span className="whitespace-nowrap">{t('Use max')}</span>
          </TradingButton>
        )}
        {faucetEnabled && (
          <Faucet asset={state.asset} refetchBalances={refetchBalances} />
        )}
      </div>
      <TradingButton type="submit" size="small" intent={Intent.Success}>
        <span className="whitespace-nowrap">
          {t('Deposit %s', state.asset.symbol)}
        </span>
      </TradingButton>
    </form>
  );
};

const TokenHeader = ({ asset }: { asset: AssetFieldsFragment }) => {
  const isErc20 = isAssetTypeERC20(asset);
  const openDialog = useAssetDetailsDialogStore((store) => store.open);

  return (
    <div className="flex items-center text-lg gap-2">
      {isErc20 && <TokenIcon address={asset.source.contractAddress} />}
      <h3 className="text-lg">
        {asset.symbol}
        {isErc20 && (
          <button
            className="ml-1 text-sm underline underline-offset-2 text-muted"
            onClick={(e) => {
              e.stopPropagation();
              openDialog(asset.id);
            }}
          >
            {truncateByChars(asset.source.contractAddress)}
          </button>
        )}
      </h3>
    </div>
  );
};

const StepBreadcrumb = ({ step }: { step: number }) => {
  return (
    <ol className="text-sm">
      {[
        'Choose an asset to deposit to the Vega network',
        'Approve deposits',
        'Deposit',
      ].map((text, i) => {
        const stepNum = i + 1;
        return (
          <li key={i} className="flex items-center gap-2">
            {step >= stepNum ? (
              <span className="block inline w-4 text-vega-green-600 dark:text-vega-green">
                <VegaIcon name={VegaIconNames.TICK} />
              </span>
            ) : (
              <span
                // align number with center of tick
                className="inline-block w-4 text-center text-muted"
              >
                {stepNum}
              </span>
            )}{' '}
            <span>{text}</span>
          </li>
        );
      })}
    </ol>
  );
};

const isApproved = (allowance: BigNumber | undefined) => {
  if (!allowance) return false;
  return allowance.isGreaterThan(0);
};
