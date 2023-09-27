import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Radio from '@radix-ui/react-radio-group';
import { DepositGetStarted } from './deposit-get-started';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import {
  addDecimal,
  isAssetTypeERC20,
  truncateByChars,
} from '@vegaprotocol/utils';
import { AssetStatus } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import {
  Intent,
  Loader,
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
import { Token } from '@vegaprotocol/smart-contracts';
import { MaxUint256 } from '@ethersproject/constants';
import { useTopTradedMarkets } from '../../lib/hooks/use-top-traded-markets';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { getAsset } from '@vegaprotocol/markets';
import classNames from 'classnames';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { Markets } from './markets';

export const Deposit = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-2/3">
        <DepositFlowContainer />
      </div>
      <div className="lg:w-1/3">
        <DepositGetStarted />
      </div>
    </div>
  );
};

const DepositFlowContainer = () => {
  const { VEGA_ENV } = useEnvironment();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const { data: assets } = useAssetsDataProvider();
  const { data: markets } = useTopTradedMarkets();
  const { config } = useEthereumConfig();

  if (!assets) return null;
  if (!config) return null;

  return (
    <DepositFlow
      assets={assets}
      assetId={assetId}
      bridgeAddress={config.collateral_bridge_contract.address}
      markets={markets || []}
      faucetEnabled={VEGA_ENV !== Networks.MAINNET}
    />
  );
};

const DepositSteps = {
  Asset: 'Asset',
  Approve: 'Approve',
  Deposit: 'Deposit',
} as const;
type Step = keyof typeof DepositSteps;

interface DepositState {
  step: Step;
  asset: AssetFieldsFragment | undefined;
  amount: string;
  allowance: BigNumber | undefined;
  balance: BigNumber | undefined;
}

const DepositFlow = ({
  assets,
  assetId,
  bridgeAddress,
  markets,
  faucetEnabled,
}: {
  assets: AssetFieldsFragment[];
  assetId?: string;
  bridgeAddress: string;
  markets: MarketMaybeWithDataAndCandles[];
  faucetEnabled: boolean;
}) => {
  const { provider, account } = useWeb3React();
  const [state, setState] = useState<DepositState>(() => {
    const asset = assets.find((a) => a.id === assetId);
    return {
      step: asset ? 'Approve' : 'Asset',
      asset,
      amount: '',
      allowance: undefined,
      balance: undefined,
    };
  });

  const onApproved = useCallback(async () => {
    if (!provider) throw new Error('no provider');
    if (!account) throw new Error('no account');
    if (!isAssetTypeERC20(state.asset)) throw new Error('no asset');

    const signer = provider.getSigner();
    const tokenContract = new Token(
      state.asset.source.contractAddress,
      signer || provider
    );
    const res = await tokenContract.allowance(account, bridgeAddress);
    const allowance = new BigNumber(
      addDecimal(res.toString(), state.asset.decimals)
    );

    setState((curr) => ({ ...curr, step: DepositSteps.Deposit, allowance }));
  }, [state.asset, bridgeAddress, account, provider]);

  const handleAssetChanged = async (asset: AssetFieldsFragment | undefined) => {
    if (!asset) {
      setState((curr) => ({
        ...curr,
        step: DepositSteps.Asset,
        asset: undefined,
        allowance: undefined,
        balance: undefined,
      }));
      return;
    }

    if (!provider) throw new Error('no provider');
    if (!isAssetTypeERC20(asset)) throw new Error('invalid asset');

    // ethereum wallet connect fetch current allowance and bypass approval
    // step if approval already given
    let allowance = new BigNumber(0);
    let balance = new BigNumber(0);
    if (account) {
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

    const step = allowance.isGreaterThan(0)
      ? DepositSteps.Deposit
      : DepositSteps.Approve;

    setState((curr) => ({
      ...curr,
      step,
      asset,
      allowance,
      balance,
    }));
  };

  return (
    <>
      <div className="flex flex-col border rounded border-default">
        <StepWrapper>
          <AssetSelector
            asset={state.asset}
            assets={assets}
            onSelect={handleAssetChanged}
            markets={markets}
            balance={state.balance}
            faucetEnabled={faucetEnabled}
          />
        </StepWrapper>
        <StepWrapper>
          <Approval
            step={state.step}
            asset={state.asset}
            allowance={state.allowance}
            bridgeAddress={bridgeAddress}
            onApproved={onApproved}
          />
        </StepWrapper>
        <StepWrapper>
          <SendDeposit
            step={state.step}
            asset={state.asset}
            allowance={state.allowance}
            balance={state.balance}
            amount={state.amount}
            setAmount={(amount) => setState((curr) => ({ ...curr, amount }))}
          />
        </StepWrapper>
      </div>
    </>
  );
};

const StepWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-4 border-b rounded gap-3 last:border-b-0 border-default">
      {children}
    </div>
  );
};

const AssetSelector = ({
  asset,
  assets,
  onSelect,
  markets,
  balance,
  faucetEnabled,
}: {
  asset?: AssetFieldsFragment;
  assets: AssetFieldsFragment[];
  onSelect: (asset?: AssetFieldsFragment) => void;
  markets: MarketMaybeWithDataAndCandles[];
  faucetEnabled: boolean;
  balance: BigNumber | undefined;
}) => {
  const [search, setSearch] = useState('');
  const [id, setId] = useState<number | null>(null);
  const { provider } = useWeb3React();
  const send = useEthTransactionStore((store) => store.create);
  const tx = useEthTransactionStore((store) => {
    return store.transactions.find((t) => t?.id == id);
  });

  const getMarketsForAsset = (a: AssetFieldsFragment) => {
    return markets
      .filter((m) => {
        const marketAsset = getAsset(m);
        return marketAsset.id === a.id;
      })
      .slice(0, 4);
  };

  const submitFaucet = async () => {
    if (!provider) throw new Error('no provider');
    if (!isAssetTypeERC20(asset)) throw new Error('no asset selected');
    const signer = provider.getSigner();
    const contract = new Token(
      asset.source.contractAddress,
      signer || provider
    );
    const id = send(contract, 'faucet', []);
    setId(id);
  };

  if (tx && tx.status === EthTxStatus.Pending) {
    return (
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Loader size="small" />
          </div>
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg">{t('Waiting for faucet...')}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (asset && isAssetTypeERC20(asset)) {
    const selectedAssetMarkets = getMarketsForAsset(asset);

    return (
      <div className="flex gap-3">
        <StepIndicator complete={true} />
        <div className="flex flex-1 gap-2">
          <div className="flex flex-col items-start flex-1 gap-2">
            <p className="text-lg">
              {asset.symbol}{' '}
              <small>{truncateByChars(asset.source.contractAddress)}</small>
            </p>
            <div className="w-full">
              <Markets markets={selectedAssetMarkets} />
            </div>
            <div className="flex gap-2">
              <TradingButton onClick={() => onSelect(undefined)} size="small">
                {t('Change asset')}
              </TradingButton>
              {faucetEnabled && (
                <TradingButton onClick={submitFaucet} size="small">
                  {t('Faucet')}
                </TradingButton>
              )}
            </div>
          </div>
          <div className="text-right">
            {balance && (
              <p className="font-mono text-lg">
                {balance.toString()}
                <small className="ml-1 text-muted font-alpha">
                  {asset.symbol}
                </small>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredAssets = assets
    .filter((a) => a.status === AssetStatus.STATUS_ENABLED)
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
      <Radio.Root
        className="flex flex-col gap-4"
        onValueChange={(value) => {
          onSelect(assets.find((a) => a.id === value));
        }}
      >
        {filteredAssets.map((asset) => {
          if (!isAssetTypeERC20(asset)) return null;

          const marketsForAsset = getMarketsForAsset(asset);

          return (
            <div key={asset.id}>
              <div className="flex gap-3">
                <Radio.Item
                  id={asset.id}
                  value={asset.id}
                  className="w-5 h-5 border-2 rounded border-vega-clight-600"
                >
                  <Radio.Indicator className="block w-4 h-4 border-2 border-white bg-vega-clight-300" />
                </Radio.Item>
                <div className="flex flex-col flex-1 gap-1">
                  <label
                    htmlFor={asset.id}
                    className="block text-lg cursor-pointer"
                  >
                    {asset.symbol}{' '}
                    <small>
                      ({truncateByChars(asset.source.contractAddress)})
                    </small>
                  </label>
                  <Markets markets={marketsForAsset} />
                </div>
              </div>
            </div>
          );
        })}
      </Radio.Root>
    </div>
  );
};

const Approval = ({
  step,
  asset,
  allowance,
  bridgeAddress,
  onApproved,
}: {
  step: Step;
  asset: AssetFieldsFragment | undefined;
  allowance: BigNumber | undefined;
  bridgeAddress: string;
  onApproved: () => void;
}) => {
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { account, provider } = useWeb3React();
  const [id, setId] = useState<number | null>(null);

  const tx = useEthTransactionStore((store) => {
    return store.transactions.find((t) => t?.id == id);
  });
  const send = useEthTransactionStore((store) => store.create);

  const handleApprove = () => {
    if (!provider) throw new Error('no provider');
    if (!isAssetTypeERC20(asset)) throw new Error('no provider');
    const signer = provider.getSigner();
    const contract = new Token(
      asset.source.contractAddress,
      signer || provider
    );
    const id = send(contract, 'approve', [
      bridgeAddress,
      MaxUint256.toString(),
    ]);
    setId(id);
  };

  useEffect(() => {
    if (!asset) return; // this can get triggered when you clear the selected asset
    if (tx?.status === EthTxStatus.Confirmed) {
      onApproved();
    }
  }, [tx?.status, asset, onApproved]);

  // No asset selected, show generic approval title
  if (!asset) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <StepIndicator complete={false} />
          <h3 className="text-lg">{t('Approval')}</h3>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <StepIndicator complete={false} />
          <h3 className="text-lg">{t('Approval')}</h3>
        </div>
        <TradingButton onClick={openDialog} size="small">
          {t('Connect Ethereum wallet')}
        </TradingButton>
      </div>
    );
  }

  if (tx && tx.status === EthTxStatus.Pending) {
    return (
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Loader size="small" />
          </div>
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg">{t('Waiting for approval...')}</h3>
            <TradingButton onClick={handleApprove} size="small">
              {t('Re-approve')}
            </TradingButton>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED: show muted re-approve button
  if (allowance && allowance.isGreaterThan(0)) {
    return (
      <div className="flex justify-between">
        <div className="flex gap-3">
          <StepIndicator complete={true} />
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg">{t('Approved')}</h3>
            <TradingButton onClick={handleApprove} size="small">
              {t('Re-approve')}
            </TradingButton>
          </div>
        </div>
        <div className="text-right">
          {allowance && (
            <div className="font-mono text-lg">
              <Allowance allowance={allowance} />
              <small className="ml-1 text-muted font-alpha">
                {asset.symbol}
              </small>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NOT APPROVED: show primary approve button
  return (
    <div className="flex justify-between">
      <div className="flex gap-3">
        <StepIndicator complete={false} />
        <div className="flex flex-col items-start gap-2">
          <h3 className="text-lg">{t('Approve deposits')}</h3>
          <p className="text-sm text-muted">
            {t(
              'Before you can make a deposit of %s you need to approve its use',
              asset.symbol
            )}
          </p>
          <TradingButton
            onClick={() => {
              if (!provider) throw new Error('no provider');
              if (!isAssetTypeERC20(asset)) throw new Error('no provider');
              const signer = provider.getSigner();
              const contract = new Token(
                asset.source.contractAddress,
                signer || provider
              );
              const id = send(contract, 'approve', [
                bridgeAddress,
                MaxUint256.toString(),
              ]);
              setId(id);
            }}
            size="small"
            intent={Intent.Success}
          >
            {t('Approve %s deposits', asset.symbol)}
          </TradingButton>
        </div>
      </div>
    </div>
  );
};

const Allowance = ({ allowance }: { allowance: BigNumber }) => {
  let value = '';

  const format = (divisor: string) => {
    const result = allowance.dividedBy(divisor);
    return result.isInteger() ? result.toString() : result.toFixed(1);
  };

  if (allowance.isGreaterThan(new BigNumber('1e14'))) {
    value = t('>100t');
  } else if (allowance.isGreaterThanOrEqualTo(new BigNumber('1e12'))) {
    // Trillion
    value = `${format('1e12')}t`;
  } else if (allowance.isGreaterThanOrEqualTo(new BigNumber('1e9'))) {
    // Billion
    value = `${format('1e9')}b`;
  } else if (allowance.isGreaterThanOrEqualTo(new BigNumber('1e6'))) {
    // Million
    value = `${format('1e6')}m`;
  } else {
    value = allowance.toString();
  }

  return <span>{value}</span>;
};

const SendDeposit = ({
  step,
  asset,
  allowance,
  balance,
  amount,
  setAmount,
}: {
  step: Step;
  asset: AssetFieldsFragment | undefined;
  allowance: BigNumber | undefined;
  balance: BigNumber | undefined;
  amount: string;
  setAmount: (amount: string) => void;
}) => {
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { account } = useWeb3React();

  const fallback = (
    <div className="flex gap-3">
      <StepIndicator complete={false} />
      <h3 className="text-lg">{t('Deposit')}</h3>
    </div>
  );

  if (step !== DepositSteps.Deposit) {
    return fallback;
  }

  if (!asset) {
    return fallback;
  }

  if (!allowance || allowance.isZero()) {
    return fallback;
  }

  if (!account) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <StepIndicator complete={false} />
          <h3 className="text-lg">{t('Deposit')}</h3>
        </div>
        <TradingButton onClick={openDialog} size="small">
          {t('Connect Ethereum wallet')}
        </TradingButton>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <div className="flex gap-3">
        <StepIndicator complete={false} />
        <div className="flex flex-col items-start gap-2">
          <h3 className="text-lg">{t('Deposit')}</h3>
          <form
            className="flex flex-col items-start gap-2"
            onSubmit={() => alert('TODO')}
          >
            <div className="flex gap-2">
              <TradingInput
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-[300px]"
              />
              {balance && (
                <TradingButton
                  size="small"
                  onClick={() => setAmount(balance.toString())}
                >
                  {t('Use max')}
                </TradingButton>
              )}
            </div>
            <TradingButton type="submit" size="small" intent={Intent.Success}>
              {t('Deposit %s', asset.symbol)}
            </TradingButton>
          </form>
        </div>
      </div>
    </div>
  );
};

const StepIndicator = ({ complete }: { complete: boolean }) => {
  const classes = classNames(
    'flex items-center mt-0.5 w-5 h-5 border-2 rounded border-vega-clight-600'
  );
  return (
    <div className={classes}>
      {complete && <VegaIcon name={VegaIconNames.TICK} />}
    </div>
  );
};
