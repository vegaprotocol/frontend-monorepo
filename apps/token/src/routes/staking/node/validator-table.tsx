import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import countryData from '../../../components/country-selector/country-data';
import { Link as UTLink, Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { ExternalLinks, toBigNum } from '@vegaprotocol/react-helpers';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import * as Schema from '@vegaprotocol/types';
import { SubHeading } from '../../../components/heading';
import {
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getOverstakedAmount,
  getOverstakingPenalty,
  getPerformancePenalty,
  getTotalPenalties,
  getUnnormalisedVotingPower,
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

  const { rawValidatorScore, performanceScore } =
    getLastEpochScoreAndPerformance(previousEpochData, node.id);

  const overstakedAmount = getOverstakedAmount(
    rawValidatorScore,
    stakedTotal,
    node.stakedTotal
  );

  const stakePercentage =
    total.isEqualTo(0) || stakedOnNode.isEqualTo(0)
      ? '-'
      : stakedOnNode.dividedBy(total).times(100).dp(2).toString() + '%';

  const totalPenaltiesAmount = getTotalPenalties(
    rawValidatorScore,
    performanceScore,
    stakedOnNode.toString(),
    total.toString()
  );

  return (
    <div className="my-12" data-testid="validator-table">
      <SubHeading title={t('profile')} />
      <RoundedWrapper>
        <KeyValueTable data-testid="validator-table-profile">
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
          <KeyValueTableRow noBorder={true}>
            <span>
              <strong>{t('STATUS')}</strong>
            </span>
            <span data-testid="validator-status">
              <strong>
                {t(statusTranslationKey(node.rankingScore.status))}
              </strong>
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>

      <div className="mb-10">
        {t('validatorTableIntro')}{' '}
        <UTLink
          href={ExternalLinks.VALIDATOR_FORUM}
          target="_blank"
          data-testid="validator-forum-link"
        >
          {t('onTheForum')}
        </UTLink>
      </div>

      <SubHeading title={t('ADDRESS')} />
      <RoundedWrapper marginBottomLarge={true}>
        <KeyValueTable data-testid="validator-table-address">
          <KeyValueTableRow>
            <span>{t('VEGA ADDRESS / PUBLIC KEY')}</span>
            <ValidatorTableCell dataTestId="validator-public-key">
              {node.pubkey}
            </ValidatorTableCell>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <span>{t('SERVER LOCATION')}</span>
            <ValidatorTableCell>
              {countryData.find((c) => c.code === node.location)?.name ||
                t('not available')}
            </ValidatorTableCell>
          </KeyValueTableRow>
          <KeyValueTableRow noBorder={true}>
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
      </RoundedWrapper>

      <SubHeading title={t('STAKE')} />
      <RoundedWrapper marginBottomLarge={true}>
        <KeyValueTable data-testid="validator-table-stake">
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
          <KeyValueTableRow noBorder={true}>
            <span>{t('STAKE SHARE')}</span>
            <span data-testid="stake-percentage">{stakePercentage}</span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>

      <SubHeading title={t('PENALTIES')} />
      <RoundedWrapper marginBottomLarge={true}>
        <KeyValueTable data-testid="validator-table-penalties">
          <KeyValueTableRow>
            <span>{t('OVERSTAKED PENALTY')}</span>
            <span>
              {getOverstakingPenalty(overstakedAmount, node.stakedTotal)}
            </span>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <span>{t('PERFORMANCE PENALTY')}</span>
            <span>{getPerformancePenalty(performanceScore)}</span>
          </KeyValueTableRow>
          <KeyValueTableRow noBorder={true}>
            <span>
              <strong>{t('TOTAL PENALTIES')}</strong>
            </span>
            <span>
              <strong>{totalPenaltiesAmount}</strong>
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>

      <SubHeading title={t('VOTING POWER')} />
      <RoundedWrapper marginBottomLarge={true}>
        <KeyValueTable data-testid="validator-table-voting-power">
          <KeyValueTableRow>
            <span>{t('UNNORMALISED VOTING POWER')}</span>
            <span>{getUnnormalisedVotingPower(rawValidatorScore)}</span>
          </KeyValueTableRow>
          <KeyValueTableRow noBorder={true}>
            <span>
              <strong>{t('NORMALISED VOTING POWER')}</strong>
            </span>
            <span>
              <strong>
                {getNormalisedVotingPower(node.rankingScore.votingPower)}
              </strong>
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>
    </div>
  );
};
