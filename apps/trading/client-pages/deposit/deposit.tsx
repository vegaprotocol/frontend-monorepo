import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DepositGetStarted } from './deposit-get-started';
import { useEnabledAssets } from '@vegaprotocol/assets';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  addDecimal,
  isAssetTypeERC20,
  removeDecimal,
  truncateByChars,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Intent, TradingButton, TradingInput } from '@vegaprotocol/ui-toolkit';
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
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Faucet } from './faucet';

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
    <div className="flex flex-col gap-4">
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
  );
};

interface DepositState {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  allowance: BigNumber | undefined;
  balance: BigNumber | undefined;
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
    };
  });

  const handleAssetChanged = useCallback(
    async (assetId: string | undefined) => {
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

  return (
    <AssetSelector
      state={state}
      setState={setState}
      assets={assets}
      onSelect={handleAssetChanged}
      markets={markets}
      faucetEnabled={faucetEnabled}
      bridgeAddress={bridgeAddress}
      confirmations={confirmations}
      refetchBalances={refetchBalances}
    />
  );
};

const AssetSelector = ({
  state,
  setState,
  assets,
  onSelect,
  markets,
  faucetEnabled,
  bridgeAddress,
  confirmations,
  refetchBalances,
}: {
  state: DepositState;
  setState: SetDepositState;
  assets: AssetFieldsFragment[];
  onSelect: (assetId: string | undefined) => void;
  markets: MarketMaybeWithDataAndCandles[];
  faucetEnabled: boolean;
  bridgeAddress: string;
  confirmations: number;
  refetchBalances: () => void;
}) => {
  const [search, setSearch] = useState('');

  const getMarketsForAsset = (a: AssetFieldsFragment) => {
    return markets
      .filter((m) => {
        const marketAsset = getAsset(m);
        return marketAsset.id === a.id;
      })
      .slice(0, 4);
  };

  if (state.asset && isAssetTypeERC20(state.asset)) {
    return (
      <div
        className={classNames(
          'p-4 rounded',
          'bg-vega-clight-600 dark:bg-vega-cdark-600'
        )}
      >
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex justify-between">
            <p className="text-lg">
              {state.asset.symbol}{' '}
              <small>
                ({truncateByChars(state.asset.source.contractAddress)})
              </small>
            </p>
            <div className="text-right">
              <Balance asset={state.asset} balance={state.balance} />
            </div>
          </div>
          <Markets markets={getMarketsForAsset(state.asset)} />
          <div className="relative pt-4 mt-4 border-t border-vega-clight-400 dark:border-vega-cdark-400">
            <TransactionContainer
              state={state}
              setState={setState}
              bridgeAddress={bridgeAddress}
              confirmations={confirmations}
              refetchBalances={refetchBalances}
              faucetEnabled={faucetEnabled}
            />
            <div className="absolute bottom-0 right-0">
              <TradingButton
                onClick={() => onSelect(undefined)}
                size="small"
                intent={Intent.Danger}
              >
                {t('Cancel')}
              </TradingButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredAssets = assets
    .filter((a) => a.source.__typename === 'ERC20')
    .filter((a) => a.symbol.toLowerCase().includes(search.toLowerCase()));
  filteredAssets.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <p>{t('Choose an asset to deposit to the Vega network')}</p>
        <div>
          <TradingInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {filteredAssets.map((a) => {
          if (!isAssetTypeERC20(a)) return null;

          const marketsForAsset = getMarketsForAsset(a);

          const content = (
            <div className="flex flex-col flex-1 gap-1">
              <div className="flex justify-between">
                <p className="text-lg">
                  {a.symbol}{' '}
                  <small>({truncateByChars(a.source.contractAddress)})</small>
                </p>
                <div className="text-right">
                  <Balance asset={a} />
                </div>
              </div>
              <Markets markets={marketsForAsset} />
            </div>
          );

          // TODO handle selected and hover states
          if (a.id === state.asset?.id) {
            return (
              <div
                key={a.id}
                className={classNames(
                  'p-4 rounded',
                  'bg-vega-clight-600 dark:bg-vega-cdark-600'
                )}
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={a.id}
              onClick={() => {
                onSelect(a.id);
              }}
              className={classNames(
                'p-4 rounded text-left',
                'bg-vega-clight-800 dark:bg-vega-cdark-800 hover:bg-vega-clight-600 dark:hover:bg-vega-cdark-600 cursor-pointer'
              )}
            >
              {content}
            </button>
          );
        })}
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
}: {
  state: DepositState;
  setState: SetDepositState;
  bridgeAddress: string;
  confirmations: number;
  refetchBalances: () => void;
  faucetEnabled: boolean;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Approval
        state={state}
        bridgeAddress={bridgeAddress}
        refetchBalances={refetchBalances}
      />
      <SendDeposit
        state={state}
        amount={state.amount}
        bridgeAddress={bridgeAddress}
        confirmations={confirmations}
        setAmount={(amount) => setState((curr) => ({ ...curr, amount }))}
        faucetEnabled={faucetEnabled}
        refetchBalances={refetchBalances}
      />
    </div>
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
      <div>
        <TradingButton onClick={openDialog} size="small">
          {t('Connect Ethereum wallet')}
        </TradingButton>
      </div>
    );
  }

  // APPROVED: show muted re-approve button
  if (state.allowance && state.allowance.isGreaterThan(0)) {
    return (
      <div className="flex justify-between">
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm">{t('Approved for use')}</p>
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
        <div className="text-right">
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
    );
  }

  // NOT APPROVED: show primary approve button
  return (
    <div className="flex flex-col items-start gap-2">
      <div>
        <h3 className="text-sm">{t('Approve deposits')}</h3>
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
  amount,
  setAmount,
  bridgeAddress,
  confirmations,
  faucetEnabled,
  refetchBalances,
}: {
  state: DepositState;
  amount: string;
  bridgeAddress: string;
  confirmations: number;
  setAmount: (amount: string) => void;
  faucetEnabled: boolean;
  refetchBalances: () => void;
}) => {
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
        removeDecimal(amount, state.asset.decimals),
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
    }
  }, [tx?.status, state.asset, refetchBalances]);
  if (!state.asset) {
    return null;
  }

  if (!account) {
    return null;
  }

  // Dont show deposit ui unless approved
  if (!state.allowance || state.allowance.isZero()) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="text-sm">{t('Deposit')}</h3>
      <form className="flex gap-2" onSubmit={submitDeposit}>
        <TradingInput
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-[300px]"
        />
        {state.balance && (
          <TradingButton
            size="small"
            onClick={() =>
              setAmount(state.balance ? state.balance.toString() : '')
            }
          >
            <span className="whitespace-nowrap">{t('Use max')}</span>
          </TradingButton>
        )}
        {faucetEnabled && (
          <Faucet asset={state.asset} refetchBalances={refetchBalances} />
        )}
        <TradingButton type="submit" size="small" intent={Intent.Success}>
          <span className="whitespace-nowrap">
            {t('Deposit %s', state.asset.symbol)}
          </span>
        </TradingButton>
      </form>
    </div>
  );
};
