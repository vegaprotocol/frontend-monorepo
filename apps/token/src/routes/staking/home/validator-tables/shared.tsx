import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  formatNumber,
  formatNumberPercentage,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import {
  Button,
  Tooltip,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import type { NodesFragmentFragment } from '../__generated___/Nodes';
import type { PreviousEpochQuery } from '../../__generated___/PreviousEpoch';

export enum ValidatorFields {
  RANKING_INDEX = 'rankingIndex',
  VALIDATOR = 'validator',
  STAKE = 'stake',
  STAKED_BY_DELEGATES = 'stakedByDelegates',
  STAKED_BY_OPERATOR = 'stakedByOperator',
  PENDING_STAKE = 'pendingStake',
  STAKE_SHARE = 'stakeShare',
  TOTAL_PENALTIES = 'totalPenalties',
  NORMALISED_VOTING_POWER = 'normalisedVotingPower',
  UNNORMALISED_VOTING_POWER = 'unnormalisedVotingPower',
  STAKE_NEEDED_FOR_PROMOTION = 'stakeNeededForPromotion',
  STAKE_NEEDED_FOR_PROMOTION_DESCRIPTION = 'stakeNeededForPromotionDescription',
  PERFORMANCE_SCORE = 'performanceScore',
  PERFORMANCE_PENALTY = 'performancePenalty',
  OVERSTAKED_AMOUNT = 'overstakedAmount',
  OVERSTAKING_PENALTY = 'overstakingPenalty',
}

export interface ValidatorsTableProps {
  data: NodesFragmentFragment[] | undefined;
  previousEpochData: PreviousEpochQuery | undefined;
  totalStake: string;
}

// Custom styling to account for the scrollbar. This is needed because the
// AG Grid places the scrollbar over the bottom validator, which obstructs
export const NODE_LIST_GRID_STYLES = `
  .ag-theme-balham-dark .ag-body-horizontal-scroll {
    opacity: 0.75;
  }
  .ag-theme-balham-dark *:hover {
    cursor: pointer;
  }
`;

export const stakedTotalPercentage = (stakeScore: string) =>
  formatNumberPercentage(toBigNum(stakeScore, 0).times(100), 2);

export const defaultColDef = {
  sortable: true,
  resizable: true,
  autoHeight: true,
  comparator: (a: string, b: string) => parseFloat(a) - parseFloat(b),
  cellStyle: { margin: '10px 0', padding: '0 12px' },
  tooltipComponent: TooltipCellComponent,
  tooltipShowDelay: 0,
  tooltipHideDelay: 0,
};

interface ValidatorRendererProps {
  data: { id: string; validator: { avatarUrl: string; name: string } };
}

export const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { t } = useTranslation();
  const { avatarUrl, name } = data.validator;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <span className="flex overflow-hidden">
        {avatarUrl && (
          <img
            className="h-6 w-6 rounded-full mr-2"
            src={avatarUrl}
            alt={`Avatar icon for ${name}`}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span>{name}</span>
      </span>
      <Link to={data.id}>
        <Button size="sm" fill={true}>
          {t('Stake')}
        </Button>
      </Link>
    </div>
  );
};

interface StakeNeededForPromotionRendererProps {
  data: {
    stakeNeededForPromotion: string | undefined;
    stakeNeededForPromotionDescription: string;
  };
}

export const StakeNeededForPromotionRenderer = ({
  data,
}: StakeNeededForPromotionRendererProps) => {
  return (
    <Tooltip description={data.stakeNeededForPromotionDescription}>
      <span>
        {data.stakeNeededForPromotion &&
          formatNumber(data.stakeNeededForPromotion, 2)}
      </span>
    </Tooltip>
  );
};

interface VotingPowerRendererProps {
  data: {
    normalisedVotingPower: string | undefined | null;
    unnormalisedVotingPower: string | undefined | null;
  };
}

export const VotingPowerRenderer = ({ data }: VotingPowerRendererProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      description={
        <>
          <div>
            {t('unnormalisedVotingPower')}: {data.unnormalisedVotingPower}
          </div>
          <div>
            {t('normalisedVotingPower')}: {data.normalisedVotingPower}
          </div>
        </>
      }
    >
      <span>{data.normalisedVotingPower}</span>
    </Tooltip>
  );
};

interface TotalStakeRendererProps {
  data: {
    stake: string;
    stakedByDelegates: string;
    stakedByOperator: string;
  };
}

export const TotalStakeRenderer = ({ data }: TotalStakeRendererProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      description={
        <>
          <div>
            {t('stakedByOperator')}: {data.stakedByOperator.toString()}
          </div>
          <div>
            {t('stakedByDelegates')}: {data.stakedByDelegates.toString()}
          </div>
          <div>
            {t('totalStake')}: <span className="font-bold">{data.stake}</span>
          </div>
        </>
      }
    >
      <span>{data.stake}</span>
    </Tooltip>
  );
};

interface TotalPenaltiesRendererProps {
  data: {
    performanceScore: string;
    performancePenalty: string;
    overstakedAmount: string;
    overstakedPenalty: string;
    totalPenalties: string;
  };
}

export const TotalPenaltiesRenderer = ({
  data,
}: TotalPenaltiesRendererProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      description={
        <>
          <div>
            <span>
              {t('performancePenalty')}: {data.performancePenalty}
            </span>
            <span className="pl-2">
              ({t('score')} {data.performanceScore})
            </span>
          </div>
          <div>
            <span>
              {t('overstakedPenalty')}: {data.overstakedPenalty}
            </span>
            <span className="pl-2">
              ({t('overstaked')} {data.overstakedAmount})
            </span>
          </div>
          <div>
            {t('totalPenalties')}:{' '}
            <span className="font-bold">{data.totalPenalties}</span>
          </div>
        </>
      }
    >
      <span>{data.totalPenalties}</span>
    </Tooltip>
  );
};
