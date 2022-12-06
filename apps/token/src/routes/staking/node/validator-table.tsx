import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import countryData from '../../../components/country-selector/country-data';
import { Link as UTLink, Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { ExternalLinks, toBigNum } from '@vegaprotocol/react-helpers';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { Schema } from '@vegaprotocol/types';
import { totalPenalties } from '../home/validator-tables/shared';
import {
  normalisedVotingPower,
  rawValidatorScore,
  unnormalisedVotingPower,
} from '../shared';
import type { ReactNode } from 'react';
import type { StakingNodeFieldsFragment } from './__generated___/Staking';
import type { PreviousEpochQuery } from '../__generated___/PreviousEpoch';

const statuses = {
  [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_ERSATZ]: 'status-ersatz',
  [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_PENDING]: 'status-pending',
  [Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT]:
    'status-tendermint',
};

const statusTranslationKey = (status: Schema.ValidatorStatus) =>
  statuses[status];

const ValidatorTableCell = ({
  children,
  dataTestId,
}: {
  children: ReactNode;
  dataTestId?: string;
}) => (
  <span data-testid={dataTestId} className="break-words">
    {children}
  </span>
);

export interface ValidatorTableProps {
  node: StakingNodeFieldsFragment;
  stakedTotal: string;
  stakedTotalAllNodes?: string;
  previousEpochData?: PreviousEpochQuery;
}

export const ValidatorTable = ({
  node,
  stakedTotal,
  previousEpochData,
}: ValidatorTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  const total = useMemo(() => new BigNumber(stakedTotal), [stakedTotal]);

  const stakedOnNode = toBigNum(node.stakedTotal, decimals);

  const location = countryData.find((c) => c.code === node.location)?.name;

  const performanceScore = new BigNumber(node.rankingScore.performanceScore).dp(
    2
  );

  const validatorScore = rawValidatorScore(previousEpochData, node.id);

  const overstakedAmount = useMemo(() => {
    const amount = validatorScore
      ? new BigNumber(validatorScore).times(total).minus(stakedOnNode).dp(2)
      : new BigNumber(0);

    return amount.isNegative() ? new BigNumber(0) : amount;
  }, [stakedOnNode, total, validatorScore]);

  const stakePercentage =
    total.isEqualTo(0) || stakedOnNode.isEqualTo(0)
      ? '-'
      : stakedOnNode.dividedBy(total).times(100).dp(2).toString() + '%';

  const performancePenalty =
    new BigNumber(1).minus(performanceScore).times(100).toString() + '%';

  const totalPenaltiesAmount = totalPenalties(
    validatorScore,
    node.rankingScore.performanceScore,
    stakedOnNode.toString(),
    total.toString()
  );

  const overstakingPenalty = useMemo(
    () =>
      overstakedAmount.dividedBy(stakedOnNode).times(100).dp(2).toString() +
      '%',
    [overstakedAmount, stakedOnNode]
  );

  return (
    <div className="mb-8" data-testid="validator-table">
      <KeyValueTable data-testid="validator-table-profile" title={t('PROFILE')}>
        <KeyValueTableRow>
          <span>{t('id')}</span>
          <ValidatorTableCell dataTestId="validator-id">
            {node.id}
          </ValidatorTableCell>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('ABOUT THIS VALIDATOR')}</span>
          <span>
            <a href={node.infoUrl}>{node.infoUrl}</a>
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>
            <strong>{t('STATUS')}</strong>
          </span>
          <span data-testid="validator-status">
            <strong>{t(statusTranslationKey(node.rankingScore.status))}</strong>
          </span>
        </KeyValueTableRow>
      </KeyValueTable>

      <div className="mb-6 text-sm">
        {t('stakingDescription2b')}{' '}
        <UTLink
          href={ExternalLinks.VALIDATOR_FORUM}
          target="_blank"
          data-testid="validator-forum-link"
        >
          {t('onTheForum')}
        </UTLink>
      </div>

      <KeyValueTable data-testid="validator-table-address" title={t('ADDRESS')}>
        <KeyValueTableRow>
          <span>{t('VEGA ADDRESS / PUBLIC KEY')}</span>
          <ValidatorTableCell dataTestId="validator-public-key">
            {node.pubkey}
          </ValidatorTableCell>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('SERVER LOCATION')}</span>
          <ValidatorTableCell>
            {location || t('not available')}
          </ValidatorTableCell>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('ETHEREUM ADDRESS')}</span>
          <span>
            <Link
              title={t('View on Etherscan (opens in a new tab)')}
              href={`${ETHERSCAN_URL}/address/${node.ethereumAddress}`}
              target="_blank"
            >
              {node.ethereumAddress}
            </Link>
          </span>
        </KeyValueTableRow>
      </KeyValueTable>

      <KeyValueTable data-testid="validator-table-stake" title={t('STAKE')}>
        <KeyValueTableRow>
          <span>{t('STAKED BY OPERATOR')}</span>
          <span data-testid="staked-by-operator">
            {formatNumber(toBigNum(node.stakedByOperator, decimals))}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('STAKED BY DELEGATES')}</span>
          <span data-testid="staked-by-delegates">
            {formatNumber(toBigNum(node.stakedByDelegates, decimals))}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>
            <strong>{t('TOTAL STAKE')}</strong>
          </span>
          <span data-testid="total-stake">
            <strong>
              {formatNumber(toBigNum(node.stakedTotal, decimals))}
            </strong>
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('PENDING STAKE')}</span>
          <span data-testid="pending-stake">
            {formatNumber(toBigNum(node.pendingStake, decimals))}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('STAKE SHARE')}</span>
          <span data-testid="stake-percentage">{stakePercentage}</span>
        </KeyValueTableRow>
      </KeyValueTable>

      <KeyValueTable
        data-testid="validator-table-penalties"
        title={t('PENALTIES')}
      >
        <KeyValueTableRow>
          <span>{t('OVERSTAKED AMOUNT')}</span>
          <span>{overstakedAmount.toString()}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('OVERSTAKED PENALTY')}</span>
          <span>{overstakingPenalty}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('PERFORMANCE SCORE')}</span>
          <span>{performanceScore.toString()}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>{t('PERFORMANCE PENALITY')}</span>
          <span>{performancePenalty}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>
            <strong>{t('TOTAL PENALTIES')}</strong>
          </span>
          <span>
            <strong>{totalPenaltiesAmount}</strong>
          </span>
        </KeyValueTableRow>
      </KeyValueTable>

      <KeyValueTable
        data-testid="validator-table-voting-power"
        title={t('VOTING POWER')}
      >
        <KeyValueTableRow>
          <span>{t('UNNORMALISED VOTING POWER')}</span>
          <span>{unnormalisedVotingPower(validatorScore)}</span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <span>
            <strong>{t('NORMALISED VOTING POWER')}</strong>
          </span>
          <span>
            <strong>
              {normalisedVotingPower(node.rankingScore.votingPower)}
            </strong>
          </span>
        </KeyValueTableRow>
      </KeyValueTable>
    </div>
  );
};
