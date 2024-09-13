import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { useT } from './use-t';
import {
  Intent,
  Button,
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
import {
  useState,
  type ComponentProps,
  forwardRef,
  type ButtonHTMLAttributes,
} from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';
import { getExternalChainShortLabel } from '@vegaprotocol/environment';

export interface AssetActions {
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId: string) => void;
  onClickDeposit?: (assetId: string) => void;
  onClickSwap?: (assetId: string) => void;
  onClickTransfer?: (assetId: string) => void;
}

type ButtonProps = {
  onClick?: () => void;
  label: string;
  icon: VegaIconNames;
} & ComponentProps<typeof Button>;

const ActionButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(({ onClick, label, icon, ...props }, ref) => (
  <Button onClick={onClick} {...props} size="lg" ref={ref}>
    <div className="flex flex-col items-center p">
      <VegaIcon name={icon} size={16} className="mb-1" />
      <span className="text-xs">{label}</span>
    </div>
  </Button>
));

const BreakdownItem = ({ data }: { data: AccountFields }) => {
  const min = BigInt(data.used);
  const max = BigInt(data.total);
  const range = max > min ? max : min;
  const value = range ? Number((min * BigInt(100)) / range) : 0;
  const intent = data.market ? Intent.Warning : Intent.Primary;

  return (
    <div className="mb-2">
      <dl className="flex items-center">
        <dt className="text-xs text-surface-2-fg ">
          {AccountTypeMapping[data.type]}
          {data.market &&
            ` (${data.market.tradableInstrument.instrument.code})`}
        </dt>
        <dd className="text-right grow text-sm leading-tight">
          {addDecimalsFormatNumberQuantum(
            data.used,
            data.asset.decimals,
            data.asset.quantum
          )}
        </dd>
      </dl>
      <ProgressBar compact value={value} intent={intent} />
    </div>
  );
};

export const AccountCard = ({
  asset,
  isReadOnly,
  partyId,
  expanded: initialExpanded,
  ...actions
}: {
  expanded?: boolean;
  asset: AssetFieldsFragment;
  isReadOnly?: boolean;
  partyId?: string;
} & AssetActions) => {
  const t = useT();
  const expandable = !!partyId;
  const [expanded, setExpanded] = useState(initialExpanded && expandable);
  const { data } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId: partyId || '', assetId: asset.id },
    skip: !partyId,
  });
  return (
    <section
      data-testid="account-card"
      className={cn('border-b', {
        'hover:bg-surface-2/20': !expanded,
      })}
    >
      <div className="relative p-3">
        <header className="flex items-center mb-3">
          <Emblem
            asset={asset.id}
            chain={
              asset.source.__typename === 'ERC20'
                ? asset.source.chainId
                : undefined
            }
          />
          <span className="grow ml-2 text-lg min-w-0">
            <span>{asset.name}</span>
            {asset.source.__typename === 'ERC20' && (
              <small className="grow text-surface-0-fg-muted ml-0.5 truncate tracking-tight">
                {getExternalChainShortLabel(asset.source.chainId)}
              </small>
            )}
          </span>
          <div className="z-10">
            <AccountsActionsDropdown
              isReadOnly={isReadOnly || !partyId}
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
              onClickSwap={() => {
                actions.onClickSwap?.(asset.id);
              }}
            />
          </div>
        </header>
        {expandable &&
          expanded &&
          data?.breakdown?.map((data) => (
            <BreakdownItem
              key={`${data.asset.id}-${data.type}-${
                data.market ? data.market.id : ''
              }`}
              data={data}
            />
          ))}
        <dl className="flex items-center mt-3 text-base">
          <dt>{t('Total')}</dt>
          <dd className="text-right leading-tight grow">
            {addDecimalsFormatNumberQuantum(
              data?.total || '0',
              asset.decimals,
              asset.quantum
            )}
          </dd>
        </dl>
        {expandable && (
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setExpanded((expanded) => !expanded)}
            data-testid="expand-account-card"
          >
            <span className="sr-only">{t('Show asset actions')}</span>
          </button>
        )}
      </div>
      {!isReadOnly && expandable && expanded ? (
        <div className="grid gap-1 grid-cols-4 p-3 pt-0">
          <ActionButton
            data-testid="account-action-deposit"
            onClick={() => actions.onClickDeposit?.(asset.id)}
            label={t('Deposit')}
            icon={VegaIconNames.DEPOSIT}
          />
          <ActionButton
            data-testid="account-action-swap"
            onClick={() => actions.onClickSwap?.(asset.id)}
            label={t('Swap')}
            icon={VegaIconNames.SWAP}
          />
          <ActionButton
            data-testid="account-action-transfer"
            onClick={() => actions.onClickTransfer?.(asset.id)}
            label={t('Transfer')}
            icon={VegaIconNames.TRANSFER}
          />
          <ActionButton
            data-testid="account-action-withdraw"
            onClick={() => actions.onClickWithdraw?.(asset.id)}
            label={t('Withdraw')}
            icon={VegaIconNames.WITHDRAW}
          />
        </div>
      ) : null}
    </section>
  );
};
