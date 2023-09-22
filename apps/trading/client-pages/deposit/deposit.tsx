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
import { CompactNumber } from '@vegaprotocol/react-helpers';

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
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const { data } = useAssetsDataProvider();
  const { config } = useEthereumConfig();
  const { data: markets } = useTopTradedMarkets();

  if (!data) return null;
  if (!config) return null;

  return (
    <DepositFlow
      assets={data}
      assetId={assetId}
      bridgeAddress={config.collateral_bridge_contract.address}
      markets={markets || []}
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
}: {
  assets: AssetFieldsFragment[];
  assetId?: string;
  bridgeAddress: string;
  markets: MarketMaybeWithDataAndCandles[];
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

// <pre className="fixed bottom-0 right-0 p-2 text-xs text-white bg-vega-pink">
//  {JSON.stringify(state, null, 2)}
// </pre>

const StepWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-start p-4 border-b rounded gap-3 last:border-b-0 border-default">
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
}: {
  asset?: AssetFieldsFragment;
  assets: AssetFieldsFragment[];
  onSelect: (asset?: AssetFieldsFragment) => void;
  markets: MarketMaybeWithDataAndCandles[];
  balance: BigNumber | undefined;
}) => {
  const [search, setSearch] = useState('');
  const getTopMarkets = (a: AssetFieldsFragment) => {
    return markets
      .filter((m) => {
        const marketAsset = getAsset(m);
        return marketAsset.id === a.id;
      })
      .slice(0, 4);
  };

  if (asset && isAssetTypeERC20(asset)) {
    return (
      <div className="flex flex-col w-full gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onSelect(undefined)}
            className="flex items-center w-5 h-5 border-2 rounded border-vega-clight-600"
          >
            <VegaIcon name={VegaIconNames.TICK} />
          </button>
          <div className="flex flex-1 gap-2">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-lg">
                {asset.symbol}{' '}
                <small>{truncateByChars(asset.source.contractAddress)}</small>
              </p>
              <Markets markets={getTopMarkets(asset)} />
            </div>
            <div className="flex flex-col items-end">
              {balance && (
                <div className="font-mono text-lg">
                  {balance.toString()}
                  <small className="ml-1 text-muted">{asset.symbol}</small>
                </div>
              )}
              <TradingButton onClick={() => onSelect(undefined)} size="small">
                Change asset
              </TradingButton>
            </div>
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
    <div className="flex flex-col w-full gap-4">
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
                  <Markets markets={getTopMarkets(asset)} />
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
        <div className="flex gap-2">
          <div className="flex items-center w-5 h-5 border-2 rounded border-vega-clight-600" />
          <h3 className="text-lg">{t('Approval')}</h3>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-between w-full">
        <h3 className="text-lg">{t('Approval')}</h3>
        <TradingButton onClick={openDialog} size="small">
          {t('Connect Ethereum wallet')}
        </TradingButton>
      </div>
    );
  }

  if (tx && tx.status === EthTxStatus.Pending) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Loader size="small" />
          <h3 className="text-lg">{t('Waiting for approval...')}</h3>
        </div>
        <TradingButton onClick={handleApprove} size="small">
          {t('Re-approve')}
        </TradingButton>
      </div>
    );
  }

  // APPROVED: show muted re-approve button
  if (!allowance || allowance.isGreaterThan(0)) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2">
          <div className="flex items-center w-5 h-5 border-2 rounded border-vega-clight-600">
            <VegaIcon name={VegaIconNames.TICK} />
          </div>
          <h3 className="text-lg">{t('Approved')}</h3>
        </div>
        <div className="flex flex-col items-end">
          {allowance && (
            <div className="font-mono text-lg">
              <Allowance allowance={allowance} />
              <small className="ml-1 text-muted">{asset.symbol}</small>
            </div>
          )}
          <TradingButton onClick={handleApprove} size="small">
            {t('Re-approve')}
          </TradingButton>
        </div>
      </div>
    );
  }

  // NOT APPROVED: show primary approve button
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-2">
        <div className="flex items-center w-5 h-5 border-2 rounded border-vega-clight-600" />
        <h3 className="text-lg">{t('Approve deposits')}</h3>
      </div>
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
    <div className="flex gap-2">
      <div className="flex items-center w-5 h-5 border-2 rounded border-vega-clight-600" />
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
      <TradingButton onClick={openDialog} size="small">
        {t('Connect Ethereum wallet')}
      </TradingButton>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-2">
        <div className="flex items-center w-5 h-5 border-2 rounded border-vega-clight-600" />
        <h3 className="text-lg">{t('Deposit')}</h3>
      </div>
      <form className="w-1/2" onSubmit={() => alert('TODO')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <TradingInput
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full"
            />
          </div>
          {balance && (
            <TradingButton
              size="small"
              onClick={() => setAmount(balance.toString())}
            >
              {t('Use max')}
            </TradingButton>
          )}
          <TradingButton type="submit" size="small" intent={Intent.Success}>
            {t('Deposit %s', asset.symbol)}
          </TradingButton>
        </div>
      </form>
    </div>
  );
};

const Markets = ({ markets }: { markets: MarketMaybeWithDataAndCandles[] }) => {
  return (
    <div className="flex gap-2">
      {markets.length ? (
        markets.map((m) => {
          return (
            <div
              key={m.id}
              className="w-1/4 px-2 py-1 text-xs rounded bg-vega-clight-700"
            >
              {m.tradableInstrument.instrument.code} {m.data?.markPrice}
            </div>
          );
        })
      ) : (
        <p className="text-xs">No markets</p>
      )}
    </div>
  );
};
