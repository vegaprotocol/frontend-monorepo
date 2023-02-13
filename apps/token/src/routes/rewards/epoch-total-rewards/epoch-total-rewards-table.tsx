import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@vegaprotocol/react-helpers';
import { Tooltip, Icon } from '@vegaprotocol/ui-toolkit';
import { AccountType } from '@vegaprotocol/types';
import { SubHeading } from '../../../components/heading';
import type { AggregatedEpochSummary } from './generate-epoch-total-rewards-list';

interface EpochTotalRewardsGridProps {
  data: AggregatedEpochSummary;
}

interface ColumnHeaderProps {
  title: string;
  tooltipContent?: string;
  className?: string;
}

interface RewardItemProps {
  value: string;
  dataTestId: string;
  last?: boolean;
}

const displayReward = (reward: string) => {
  if (Number(reward) === 0) {
    return <span className="text-vega-dark-300">0</span>;
  }

  if (reward.split('.')[1] && reward.split('.')[1].length > 4) {
    return (
      <Tooltip description={formatNumber(reward)}>
        <button>{formatNumber(Number(reward).toFixed(4))}</button>
      </Tooltip>
    );
  }

  return <span>{formatNumber(reward)}</span>;
};

const gridStyles = classNames(
  'grid grid-cols-[repeat(8,minmax(100px,auto))] max-w-full overflow-auto',
  `border-t border-vega-dark-200`,
  'text-sm'
);

const headerGridItemStyles = (last = false) =>
  classNames('border-r border-b border-b-vega-dark-200', 'py-3 px-5', {
    'border-r-vega-dark-150': !last,
    'border-r-0': last,
  });

const rowGridItemStyles = (last = false) =>
  classNames('relative', 'border-r border-b border-b-vega-dark-150', {
    'border-r-vega-dark-150': !last,
    'border-r-0': last,
  });

const ColumnHeader = ({
  title,
  tooltipContent,
  className,
}: ColumnHeaderProps) => (
  <div className={className}>
    <h2 className="mb-1 text-sm text-vega-dark-300">{title}</h2>
    {tooltipContent && (
      <Tooltip description={tooltipContent}>
        <button>
          <Icon name={'info-sign'} className="text-vega-dark-200" />
        </button>
      </Tooltip>
    )}
  </div>
);

const RewardItem = ({ value, dataTestId, last }: RewardItemProps) => (
  <div data-testid={dataTestId} className={rowGridItemStyles(last)}>
    <div className="h-full w-5 absolute right-0 top-0 bg-gradient-to-r from-transparent to-black pointer-events-none" />
    <div className="overflow-auto p-5">{displayReward(value)}</div>
    <div className="h-full w-5 absolute left-0 top-0 bg-gradient-to-l from-transparent to-black pointer-events-none" />
  </div>
);

export const EpochTotalRewardsTable = ({
  data,
}: EpochTotalRewardsGridProps) => {
  const { t } = useTranslation();

  const rowData = data.assetRewards.map(({ name, rewards, totalAmount }) => ({
    name,
    ACCOUNT_TYPE_GLOBAL_REWARD:
      rewards
        .filter((r) => r.rewardType === AccountType.ACCOUNT_TYPE_GLOBAL_REWARD)
        .map((r) => r.amount)[0] || '0',
    ACCOUNT_TYPE_FEES_INFRASTRUCTURE:
      rewards
        .filter(
          (r) => r.rewardType === AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE
        )
        .map((r) => r.amount)[0] || '0',
    ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES:
      rewards
        .filter(
          (r) =>
            r.rewardType === AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES
        )
        .map((r) => r.amount)[0] || '0',
    ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES:
      rewards
        .filter(
          (r) =>
            r.rewardType === AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES
        )
        .map((r) => r.amount)[0] || '0',
    ACCOUNT_TYPE_FEES_LIQUIDITY:
      rewards
        .filter((r) => r.rewardType === AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY)
        .map((r) => r.amount)[0] || '0',
    ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS:
      rewards
        .filter(
          (r) =>
            r.rewardType === AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS
        )
        .map((r) => r.amount)[0] || '0',
    totalAmount: totalAmount,
  }));

  return (
    <div data-testid="epoch-total-rewards-table" className="mb-12">
      <SubHeading title={`EPOCH ${data.epoch}`} />

      <div className={gridStyles}>
        <ColumnHeader
          title={t('rewardsColAssetHeader')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColStakingHeader')}
          tooltipContent={t('rewardsColStakingTooltip')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColInfraHeader')}
          tooltipContent={t('rewardsColInfraTooltip')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColPriceTakingHeader')}
          tooltipContent={t('rewardsColPriceTakingTooltip')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColPriceMakingHeader')}
          tooltipContent={t('rewardsColPriceMakingTooltip')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColLiquidityProvisionHeader')}
          tooltipContent={t('rewardsColLiquidityProvisionTooltip')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColMarketCreationHeader')}
          tooltipContent={t('rewardsColMarketCreationTooltip')}
          className={headerGridItemStyles()}
        />
        <ColumnHeader
          title={t('rewardsColTotalHeader')}
          className={headerGridItemStyles(true)}
        />

        {rowData.map((row, i) => (
          <div className="contents" key={i}>
            <div data-testid="asset" className={`${rowGridItemStyles()} p-5`}>
              {row.name}
            </div>
            <RewardItem
              dataTestId="global"
              value={row.ACCOUNT_TYPE_GLOBAL_REWARD}
            />
            <RewardItem
              dataTestId="infra"
              value={row.ACCOUNT_TYPE_FEES_INFRASTRUCTURE}
            />
            <RewardItem
              dataTestId="taker"
              value={row.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES}
            />
            <RewardItem
              dataTestId="maker"
              value={row.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES}
            />
            <RewardItem
              dataTestId="liquidity"
              value={row.ACCOUNT_TYPE_FEES_LIQUIDITY}
            />
            <RewardItem
              dataTestId="market-maker"
              value={row.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS}
            />
            <RewardItem
              dataTestId="total"
              value={row.totalAmount}
              last={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
