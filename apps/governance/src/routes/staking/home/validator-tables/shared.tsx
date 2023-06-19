import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  formatNumber,
  formatNumberPercentage,
  toBigNum,
} from '@vegaprotocol/utils';
import {
  Button,
  Tooltip,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../../lib/bignumber';
import type { NodesFragmentFragment } from '../__generated__/Nodes';
import type { PreviousEpochQuery } from '../../__generated__/PreviousEpoch';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import type { StakingDelegationFieldsFragment } from '../../__generated__/Staking';
import type { ValidatorsView } from './validator-tables';
import { VALIDATOR_LOGO_MAP } from './logo-map';

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
  // the following are additional fields added to the validator object displaying user data
  STAKED_BY_USER = 'stakedByUser',
  PENDING_USER_STAKE = 'pendingUserStake',
  USER_STAKE_SHARE = 'userStakeShare',
}

export const addUserDataToValidator = (
  validator: NodesFragmentFragment,
  currentEpochUserStaking: StakingDelegationFieldsFragment | undefined,
  nextEpochUserStaking: StakingDelegationFieldsFragment | undefined,
  currentUserStakeAvailable: string
) => {
  return {
    ...validator,
    [ValidatorFields.STAKED_BY_USER]:
      currentEpochUserStaking && Number(currentEpochUserStaking?.amount) > 0
        ? currentEpochUserStaking.amount
        : undefined,
    [ValidatorFields.PENDING_USER_STAKE]: nextEpochUserStaking
      ? new BigNumber(nextEpochUserStaking?.amount)
          .minus(new BigNumber(currentEpochUserStaking?.amount || 0))
          .toString()
      : undefined,
    [ValidatorFields.USER_STAKE_SHARE]:
      currentEpochUserStaking && Number(currentEpochUserStaking.amount) > 0
        ? new BigNumber(currentEpochUserStaking.amount)
            .dividedBy(new BigNumber(currentUserStakeAvailable))
            .times(100)
        : undefined,
  };
};

export type ValidatorWithUserData = NodesFragmentFragment & {
  stakedByUser?: string;
  pendingUserStake?: string;
  userStakeShare?: string;
};

export interface ValidatorsTableProps {
  data: ValidatorWithUserData[] | undefined;
  previousEpochData: PreviousEpochQuery | undefined;
  totalStake: string;
  validatorsView: ValidatorsView;
}

export const stakedTotalPercentage = (stakeScore: string) =>
  formatNumberPercentage(toBigNum(stakeScore, 0).times(100), 2);

export const defaultColDef = {
  sortable: true,
  resizable: true,
  autoHeight: true,
  comparator: (a: string, b: string) => parseFloat(a) - parseFloat(b),
  tooltipComponent: TooltipCellComponent,
  cellStyle: { display: 'flex', alignItems: 'center', padding: '0 10px' },
};

interface ValidatorRendererProps {
  data: {
    id: string;
    validator: { avatarUrl: string; name: string };
    stakedByUser: string | undefined;
  };
}

export const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { t } = useTranslation();
  const { avatarUrl, name } = data.validator;
  const logo = VALIDATOR_LOGO_MAP[data.id]
    ? VALIDATOR_LOGO_MAP[data.id]
    : avatarUrl
    ? avatarUrl
    : null;
  return (
    <div className="w-[238px] grid grid-cols-[1fr_auto] gap-2 items-center">
      <span className="flex overflow-hidden">
        {logo && (
          <img
            className="h-6 w-6 rounded-full mr-2"
            src={logo}
            alt={`Avatar icon for ${name}`}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span>{name}</span>
      </span>
      <Link to={data.id}>
        {data.stakedByUser ? (
          <Button
            data-testid="my-stake-btn"
            size="sm"
            className="text-vega-green border-vega-green"
          >
            {t('myStake')}
          </Button>
        ) : (
          <Button data-testid="stake-btn" size="sm" fill={true}>
            {t('Stake')}
          </Button>
        )}
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
    <Tooltip
      description={
        <span data-testid="stake-needed-for-promotion-tooltip">
          {data.stakeNeededForPromotionDescription}
        </span>
      }
    >
      <span data-testid="stake-needed-for-promotion">
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
          <div data-testid="unnormalised-voting-power-tooltip">
            {t('unnormalisedVotingPower')}: {data.unnormalisedVotingPower}
          </div>
          <div data-testid="normalised-voting-power-tooltip">
            {t('normalisedVotingPower')}: {data.normalisedVotingPower}
          </div>
        </>
      }
    >
      <span data-testid="normalised-voting-power">
        {data.normalisedVotingPower}
      </span>
    </Tooltip>
  );
};

interface PendingStakeRendererProps {
  data: {
    pendingStake: string;
    pendingUserStake: string | undefined;
  };
}

export const PendingStakeRenderer = ({ data }: PendingStakeRendererProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  return (
    <Tooltip
      description={
        <>
          <div data-testid="pending-stake-tooltip">
            {t('pendingStake')}:{' '}
            {formatNumber(toBigNum(data.pendingStake, decimals), decimals)}
          </div>
          {data.pendingUserStake && (
            <div
              className="text-vega-green border-t border-t-vega-dark-200 mt-1.5 pt-1"
              data-testid="pending-user-stake-tooltip"
            >
              {t('myPendingStake')}:{' '}
              {formatNumber(
                toBigNum(data.pendingUserStake, decimals),
                decimals
              )}
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col">
        {data.pendingUserStake && data.pendingStake !== '0' && (
          <span data-testid="pending-user-stake" className="text-vega-green">
            {formatNumber(toBigNum(data.pendingUserStake, decimals), 2)}
          </span>
        )}
        <span data-testid="total-pending-stake">
          {formatNumber(toBigNum(data.pendingStake, decimals), 2)}
        </span>
      </div>
    </Tooltip>
  );
};

interface TotalStakeRendererProps {
  data: {
    stake: string;
    stakedByDelegates: string;
    stakedByOperator: string;
    stakedByUser: string | undefined;
  };
}

export const TotalStakeRenderer = ({ data }: TotalStakeRendererProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  const formattedStake = formatNumber(toBigNum(data.stake, decimals), 2);

  return (
    <Tooltip
      description={
        <>
          <div data-testid="staked-operator-tooltip">
            {t('stakedByOperator')}: {data.stakedByOperator.toString()}
          </div>
          <div data-testid="staked-delegates-tooltip">
            {t('stakedByDelegates')}: {data.stakedByDelegates.toString()}
          </div>
          <div className="font-bold" data-testid="total-staked-tooltip">
            {t('totalStake')}: {formattedStake}
          </div>
          {data.stakedByUser && (
            <div
              className="text-vega-green border-t border-t-vega-dark-200 mt-1.5 pt-1"
              data-testid="staked-by-user-tooltip"
            >
              {t('stakedByMe')}: {data.stakedByUser}
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col">
        {data.stakedByUser && (
          <span data-testid="user-stake" className="text-vega-green">
            {data.stakedByUser}
          </span>
        )}
        <span data-testid="total-stake">{formattedStake}</span>
      </div>
    </Tooltip>
  );
};

interface StakeShareRendererProps {
  data: {
    stakeShare: string;
    userStakeShare: string | undefined;
  };
}

export const StakeShareRenderer = ({ data }: StakeShareRendererProps) => {
  return (
    <div className="flex flex-col">
      {data.userStakeShare && (
        <span data-testid="user-stake-share" className="text-vega-green">
          {data.userStakeShare}
        </span>
      )}
      <span data-testid="total-stake-share">{data.stakeShare}</span>
    </div>
  );
};

interface TotalPenaltiesRendererProps {
  data: {
    performanceScore: string;
    performancePenalty: string;
    overstakedAmount: string;
    overstakingPenalty: string;
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
          <div data-testid="performance-penalty-tooltip">
            {t('performancePenalty')}: {data.performancePenalty}
          </div>
          <div data-testid="overstaked-penalty-tooltip">
            {t('overstakedPenalty')}: {data.overstakingPenalty}
          </div>
        </>
      }
    >
      <span data-testid="total-penalty">{data.totalPenalties}</span>
    </Tooltip>
  );
};
