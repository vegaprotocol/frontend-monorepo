import type { ReactNode} from 'react';
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

  if (!data) return null;
  if (!config) return null;

  return (
    <DepositFlow
      assets={data}
      assetId={assetId}
      bridgeAddress={config.collateral_bridge_contract.address}
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
}

const DepositFlow = ({
  assets,
  assetId,
  bridgeAddress,
}: {
  assets: AssetFieldsFragment[];
  assetId?: string;
  bridgeAddress: string;
}) => {
  const { provider, account } = useWeb3React();
  const [state, setState] = useState<DepositState>(() => {
    const asset = assets.find((a) => a.id === assetId);
    return {
      step: asset ? 'Approve' : 'Asset',
      asset,
      amount: '',
      allowance: undefined,
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
      }));
      return;
    }

    if (!provider) throw new Error('no provider');
    if (!account) throw new Error('no account');
    if (!isAssetTypeERC20(asset)) throw new Error('invalid asset');

    const signer = provider.getSigner();
    const tokenContract = new Token(
      asset.source.contractAddress,
      signer || provider
    );
    const res = await tokenContract.allowance(account, bridgeAddress);
    const allowance = new BigNumber(addDecimal(res.toString(), asset.decimals));

    const step = allowance.isGreaterThan(0)
      ? DepositSteps.Deposit
      : DepositSteps.Approve;

    setState((curr) => ({
      ...curr,
      step,
      asset,
      allowance,
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
            amount={state.amount}
            setAmount={(amount) => setState((curr) => ({ ...curr, amount }))}
          />
        </StepWrapper>
      </div>
      <pre className="fixed bottom-0 right-0 p-2 text-xs text-white bg-vega-pink">
        {JSON.stringify(state, null, 2)}
      </pre>
    </>
  );
};

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
}: {
  asset?: AssetFieldsFragment;
  assets: AssetFieldsFragment[];
  onSelect: (asset?: AssetFieldsFragment) => void;
}) => {
  const [search, setSearch] = useState('');

  if (asset && isAssetTypeERC20(asset)) {
    return (
      <div className="flex items-center w-full gap-2">
        <button
          onClick={() => onSelect(undefined)}
          className="w-5 h-5 border-2 rounded border-vega-clight-600"
        >
          <div className="block w-4 h-4 border-2 border-white bg-vega-clight-300" />
        </button>
        <p className="block text-lg">
          {asset.symbol}{' '}
          <small>({truncateByChars(asset.source.contractAddress)})</small>
        </p>
        <TradingButton
          onClick={() => onSelect(undefined)}
          size="small"
          className="ml-auto"
        >
          Change asset
        </TradingButton>
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
              <div className="flex items-center gap-2">
                <Radio.Item
                  id={asset.id}
                  value={asset.id}
                  className="w-5 h-5 border-2 rounded border-vega-clight-600"
                >
                  <Radio.Indicator className="block w-4 h-4 border-2 border-white bg-vega-clight-300" />
                </Radio.Item>
                <label
                  htmlFor={asset.id}
                  className="block text-lg cursor-pointer"
                >
                  {asset.symbol}{' '}
                  <small>
                    ({truncateByChars(asset.source.contractAddress)})
                  </small>
                </label>
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
    if (tx?.status === EthTxStatus.Confirmed) {
      onApproved();
    }
  }, [tx?.status, onApproved]);

  if (!asset) {
    return <h3 className="text-lg">Approval</h3>;
  }

  if (tx) {
    let title = t('Approval');
    if (tx.status === EthTxStatus.Confirmed) {
      title = t('Approved');
    } else if (tx.status === EthTxStatus.Pending) {
      title = t('Waiting for approval...');
    }
    return (
      <div className="flex items-center justify-between w-full">
        <h3 className="text-lg">{title}</h3>
        <TradingButton onClick={handleApprove} size="small">
          {t('Re-approve')}
        </TradingButton>
      </div>
    );
  }

  if (step !== DepositSteps.Approve) {
    if (!allowance) {
      return <h3 className="text-lg">Approval</h3>;
    }
    if (allowance.isGreaterThan(0)) {
      return (
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg">{t('Approved')}</h3>
          <TradingButton onClick={handleApprove} size="small">
            {t('Re-approve')}
          </TradingButton>
        </div>
      );
    }
  }

  if (!account) {
    return (
      <div className="flex items-center justify-between w-full">
        <h3 className="text-lg">{t('Approved')}</h3>
        <TradingButton onClick={openDialog} size="small">
          {t('Connect Ethereum wallet')}
        </TradingButton>
      </div>
    );
  }

  if (!allowance) {
    return <h3 className="text-lg">Loading balances...</h3>;
  }

  return (
    <div className="flex items-center justify-between w-full">
      <h3 className="text-lg">{t('Deposits not approved')}</h3>
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

const SendDeposit = ({
  step,
  asset,
  allowance,
  amount,
  setAmount,
}: {
  step: Step;
  asset: AssetFieldsFragment | undefined;
  allowance: BigNumber | undefined;
  amount: string;
  setAmount: (amount: string) => void;
}) => {
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { account } = useWeb3React();

  if (step !== DepositSteps.Deposit) {
    return <h3 className="text-lg">Confirm deposit</h3>;
  }

  if (!asset) {
    return <p>Please select asset</p>;
  }

  if (!allowance) {
    return <h3 className="text-lg">Confirm deposit</h3>;
  }
  if (allowance.isZero()) return null;

  if (!account) {
    return (
      <TradingButton onClick={openDialog} size="small">
        {t('Connect Ethereum wallet')}
      </TradingButton>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <h3 className="text-lg">{t('Confirm deposit')}</h3>
      <form
        className="flex items-center justify-between w-1/2 gap-2"
        onSubmit={() => alert('TODO')}
      >
        <div className="flex-1">
          <TradingInput
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full"
          />
        </div>
        <TradingButton type="submit" size="small" intent={Intent.Success}>
          {t('Deposit %s', asset.symbol)}
        </TradingButton>
      </form>
    </div>
  );
};
