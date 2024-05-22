import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { useT } from './use-t';
import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
  ProgressBar,
} from '@vegaprotocol/ui-toolkit';

import {
  type AccountFields,
  aggregatedAccountDataProvider,
} from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';

import { Emblem } from '@vegaprotocol/emblem';
import { AccountsActionsDropdown } from './accounts-actions-dropdown';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useState } from 'react';

export type PinnedAsset = string;

interface Actions {
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId: string) => void;
  onClickDeposit?: (assetId: string) => void;
  onClickSwap?: (assetId: string) => void;
  onClickTransfer?: (assetId: string) => void;
}
export interface AccountTableProps extends Actions {
  rowData?: AssetFieldsFragment[] | null;
  isReadOnly: boolean;
  pinnedAssets?: PinnedAsset[];
}

const Button = ({
  onClick,
  label,
  icon,
}: {
  onClick?: () => void;
  label: string;
  icon: VegaIconNames;
}) => (
  <TradingButton size="custom" className="p-[6px]" onClick={onClick}>
    <div className="flex flex-col items-center p">
      <VegaIcon name={icon} size={16} className="mb-1" />
      <span className="text-xs">{label}</span>
    </div>
  </TradingButton>
);

const BreakdownItem = ({ data }: { data: AccountFields }) => {
  const min = BigInt(data.used);
  const max = BigInt(data.total);
  const range = max > min ? max : min;
  const value = range ? Number((min * BigInt(100)) / range) : 0;
  const intent = data.market ? Intent.Warning : Intent.Primary;

  return (
    <div className="mb-2">
      <div className="flex items-center">
        <div className="text-xs font-alpha text-vega-clight-200 dark:text-vega-cdark-200">
          {AccountTypeMapping[data.type]}
          {data.market && `(${data.market.tradableInstrument.instrument.code})`}
        </div>
        <div className="text-right grow text-base leading-tight font-alpha">
          {addDecimalsFormatNumberQuantum(
            data.used,
            data.asset.decimals,
            data.asset.quantum
          )}
        </div>
      </div>
      <ProgressBar compact value={value} intent={intent} />
    </div>
  );
};

export const AccountCard = ({
  asset,
  isReadOnly,
  partyId,
  ...actions
}: {
  asset: AssetFieldsFragment;
  isReadOnly?: boolean;
  partyId?: string;
} & Actions) => {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const { data } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId: partyId || '', assetId: asset.id },
    skip: !partyId,
  });
  return (
    <div className="p-3 border-b border-default relative">
      <div className="flex items-center mb-3">
        <Emblem asset={asset.id} />
        <span className="grow ml-2 text-lg">{asset.symbol}</span>
        <div className="z-10">
          <AccountsActionsDropdown
            isReadOnly={isReadOnly}
            assetId={asset.id}
            assetContractAddress={
              asset.source?.__typename === 'ERC20'
                ? asset.source.contractAddress
                : undefined
            }
            onClickDeposit={() => {
              actions.onClickDeposit?.(asset.id);
            }}
            onClickWithdraw={() => {
              actions.onClickWithdraw?.(asset.id);
            }}
            onClickTransfer={() => {
              actions.onClickTransfer?.(asset.id);
            }}
          />
        </div>
      </div>
      {data?.breakdown?.map((data) => (
        <BreakdownItem data={data} />
      ))}
      <div className="flex items-center mt-3">
        <div className="text-base font-alpha">{t('Total')}</div>
        <div className="text-right leading-tight font-alpha grow text-base">
          {addDecimalsFormatNumberQuantum(
            data?.total || '0',
            asset.decimals,
            asset.quantum
          )}
        </div>
      </div>
      {expanded ? (
        <div className="grid gap-1 grid-cols-4 mt-3">
          <Button
            onClick={() => actions.onClickDeposit?.(asset.id)}
            label={t('Deposit')}
            icon={VegaIconNames.DEPOSIT}
          />
          <Button
            onClick={() => actions.onClickSwap?.(asset.id)}
            label={t('Swap')}
            icon={VegaIconNames.SWAP}
          />
          <Button
            onClick={() => actions.onClickTransfer?.(asset.id)}
            label={t('Transfer')}
            icon={VegaIconNames.TRANSFER}
          />
          <Button
            onClick={() => actions.onClickWithdraw?.(asset.id)}
            label={t('Withdraw')}
            icon={VegaIconNames.WITHDRAW}
          />
        </div>
      ) : (
        <button
          className="absolute inset-0"
          onClick={() => setExpanded(true)}
        ></button>
      )}
    </div>
  );
};
export const AccountTable = ({
  rowData,
  pinnedAssets,
  ...props
}: AccountTableProps) => {
  return (
    rowData &&
    (pinnedAssets && pinnedAssets.length
      ? [
          ...rowData.filter((asset) => pinnedAssets?.includes(asset.id)),
          ...rowData.filter((asset) => !pinnedAssets?.includes(asset.id)),
        ]
      : rowData
    ).map((asset) => {
      return <AccountCard asset={asset} key={asset.id} {...props} />;
    })
  );
};
