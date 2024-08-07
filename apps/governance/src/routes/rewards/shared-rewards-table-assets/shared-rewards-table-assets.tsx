import classNames from 'classnames';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { SubHeading } from '../../../components/heading';
import { AccountType } from '@vegaprotocol/types';

// This is the data structure that matters for defining which Account types
// are displayed in the rewards tables. It sets column titles and tooltips,
// and is used to filter the data that is passed to functions to generate
// the table rows. It's important to preserve the order.
export const RowAccountTypes = {
  [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
    columnTitle: 'rewardsColStakingHeader',
    description: 'rewardsColStakingTooltip',
  },
  [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
    columnTitle: 'rewardsColInfraHeader',
    description: 'rewardsColInfraTooltip',
  },
};

interface ColumnHeaderProps {
  title: string;
  tooltipContent?: string;
  className?: string;
}

const headerGridItemStyles = (last = false) =>
  classNames('border-r border-b border-default', 'py-3 px-5', {
    'border-r-0': last,
  });

export const rowGridItemStyles = (last = false) =>
  classNames('relative', 'border-r border-b border-default', {
    'border-r-0': last,
  });

const gridStyles = classNames(
  'grid grid-cols-[repeat(4,minmax(100px,auto))] max-w-full overflow-auto',
  `border-t border-default`,
  'text-sm'
);

const ColumnHeader = ({
  title,
  tooltipContent,
  className,
}: ColumnHeaderProps) => (
  <div className={className}>
    <h2 className="mb-1 text-sm text-gs-100">{title}</h2>
    {tooltipContent && (
      <Tooltip description={tooltipContent}>
        <button>
          <Icon name={'info-sign'} className="text-gs-100" />
        </button>
      </Tooltip>
    )}
  </div>
);

const ColumnHeaders = ({
  marketCreationQuantumMultiple,
}: {
  marketCreationQuantumMultiple: string | null;
}) => {
  const { t } = useTranslation();
  return (
    <div className="contents">
      <ColumnHeader
        title={t('rewardsColAssetHeader')}
        className={headerGridItemStyles()}
      />
      {Object.values(RowAccountTypes).map(({ columnTitle, description }) => (
        <ColumnHeader
          key={columnTitle}
          title={t(columnTitle)}
          tooltipContent={t(description, {
            marketCreationQuantumMultiple,
          })}
          className={headerGridItemStyles()}
        />
      ))}
      <ColumnHeader
        title={t('rewardsColTotalHeader')}
        className={headerGridItemStyles(true)}
      />
    </div>
  );
};

export interface RewardTableProps {
  dataTestId: string;
  epoch: number;
  children: ReactNode;
  marketCreationQuantumMultiple: string | null;
}

// Rewards table children will be the row items. Make sure they contain
// the same number of columns and map to the data of the ColumnHeaders component.
export const RewardsTable = ({
  dataTestId,
  epoch,
  children,
  marketCreationQuantumMultiple,
}: RewardTableProps) => (
  <div data-testid={dataTestId} className="mb-12">
    <SubHeading title={`EPOCH ${epoch}`} />

    <div className={gridStyles}>
      <ColumnHeaders
        marketCreationQuantumMultiple={marketCreationQuantumMultiple}
      />
      {children}
    </div>
  </div>
);
