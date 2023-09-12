import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useEnvironment,
  DocsLinks,
  ExternalLinks,
} from '@vegaprotocol/environment';
import {
  formatNumberPercentage,
  removePaginationWrapper,
  toBigNum,
} from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  Link as UTLink,
  Link,
  Tooltip,
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import countryData from '../../../components/country-selector/country-data';
import { SubHeading } from '../../../components/heading';
import {
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getUnnormalisedVotingPower,
  getStakePercentage,
  calculatesPerformancePenalty,
  calculateOverstakedPenalty,
  calculateOverallPenalty,
} from '../shared';
import type { ReactNode } from 'react';
import type { StakingNodeFieldsFragment } from '../__generated__/Staking';
import type { PreviousEpochQuery } from '../__generated__/PreviousEpoch';

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

  const { rawValidatorScore } = getLastEpochScoreAndPerformance(
    previousEpochData,
    node.id
  );

  const stakePercentage = getStakePercentage(total, stakedOnNode);

  const penalties = useMemo(() => {
    const allNodesInPreviousEpoch = removePaginationWrapper(
      previousEpochData?.epoch.validatorsConnection?.edges
    );
    return {
      // current epoch
      performance: calculatesPerformancePenalty(
        node.rankingScore.performanceScore
      ),
      // previous epoch
      overstaked: calculateOverstakedPenalty(node.id, allNodesInPreviousEpoch),
      overall: calculateOverallPenalty(node.id, allNodesInPreviousEpoch),
    };
  }, [node, previousEpochData?.epoch.validatorsConnection?.edges]);

  return (
    <>
      <p className="mb-12">
        {t('validatorFormIntro')}{' '}
        {DocsLinks && (
          <ExternalLink
            href={DocsLinks.STAKING_GUIDE}
            target="_blank"
            data-testid="validator-table-staking-guide-link"
            className="text-white"
          >
            {t('readMoreValidatorForm')}
          </ExternalLink>
        )}
      </p>

      <div className="my-12" data-testid="validator-table">
        <SubHeading title={t('profile')} />
        <div className="break-all">
          <RoundedWrapper paddingBottom={true}>
            <KeyValueTable data-testid="validator-table-profile">
              <KeyValueTableRow>
                <span>{t('id')}</span>
                <ValidatorTableCell dataTestId="validator-id">
                  {node.id}
                </ValidatorTableCell>
              </KeyValueTableRow>
              <KeyValueTableRow>
                <span>{t('ABOUT THIS VALIDATOR')}</span>

                <Tooltip description={t('AboutThisValidatorDescription')}>
                  <a
                    data-testid="validator-description-url"
                    href={node.infoUrl}
                  >
                    {node.infoUrl}
                  </a>
                </Tooltip>
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={true}>
                <span>
                  <strong>{t('STATUS')}</strong>
                </span>

                <Tooltip description={t('ValidatorStatusDescription')}>
                  <span data-testid="validator-status">
                    <strong>
                      {t(statusTranslationKey(node.rankingScore.status))}
                    </strong>
                  </span>
                </Tooltip>
              </KeyValueTableRow>
            </KeyValueTable>
          </RoundedWrapper>
        </div>

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
        <div className="break-all">
          <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
            <KeyValueTable data-testid="validator-table-address">
              <KeyValueTableRow>
                <span>{t('VEGA ADDRESS / PUBLIC KEY')}</span>
                <ValidatorTableCell dataTestId="validator-public-key">
                  {node.pubkey}
                </ValidatorTableCell>
              </KeyValueTableRow>
              <KeyValueTableRow>
                <span>{t('SERVER LOCATION')}</span>
                <ValidatorTableCell dataTestId="validator-server-location">
                  {countryData.find((c) => c.code === node.location)?.name ||
                    t('not available')}
                </ValidatorTableCell>
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={true}>
                <span>{t('ETHEREUM ADDRESS')}</span>
                <span data-testid="validator-eth-address">
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
        </div>

        <SubHeading title={t('STAKE')} />
        <div className="break-all">
          <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
            <KeyValueTable data-testid="validator-table-stake">
              <KeyValueTableRow>
                <span>{t('STAKED BY OPERATOR')}</span>

                <Tooltip description={t('StakedByOperatorDescription')}>
                  <span data-testid="staked-by-operator">
                    {formatNumber(toBigNum(node.stakedByOperator, decimals))}
                  </span>
                </Tooltip>
              </KeyValueTableRow>
              <KeyValueTableRow>
                <span>{t('STAKED BY DELEGATES')}</span>

                <Tooltip description={t('StakedByDelegatesDescription')}>
                  <span data-testid="staked-by-delegates">
                    {formatNumber(toBigNum(node.stakedByDelegates, decimals))}
                  </span>
                </Tooltip>
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

                <Tooltip description={t('PendingStakeDescription')}>
                  <span data-testid="pending-stake">
                    {formatNumber(toBigNum(node.pendingStake, decimals))}
                  </span>
                </Tooltip>
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={true}>
                <span>{t('STAKE SHARE')}</span>

                <Tooltip description={t('StakeShareDescription')}>
                  <span data-testid="stake-percentage">{stakePercentage}</span>
                </Tooltip>
              </KeyValueTableRow>
            </KeyValueTable>
          </RoundedWrapper>
        </div>

        <SubHeading title={t('PENALTIES')} />
        <div className="break-all">
          <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
            <KeyValueTable data-testid="validator-table-penalties">
              <KeyValueTableRow>
                <span>{t('OVERSTAKED PENALTY')}</span>

                <Tooltip description={t('OverstakedPenaltyDescription')}>
                  <span data-testid="overstaking-penalty">
                    {formatNumberPercentage(penalties.overstaked, 2)}
                  </span>
                </Tooltip>
              </KeyValueTableRow>
              <KeyValueTableRow>
                <span>{t('PERFORMANCE PENALTY')}</span>

                <Tooltip description={t('PerformancePenaltyDescription')}>
                  <span data-testid="performance-penalty">
                    {formatNumberPercentage(penalties.performance, 2)}
                  </span>
                </Tooltip>
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={true}>
                <span>
                  <strong>{t('TOTAL PENALTIES')}</strong>
                </span>
                <span data-testid="total-penalties">
                  <strong>
                    {formatNumberPercentage(penalties.overall, 2)}
                  </strong>
                </span>
              </KeyValueTableRow>
            </KeyValueTable>
          </RoundedWrapper>
        </div>

        <SubHeading title={t('VOTING POWER')} />
        <div className="break-all">
          <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
            <KeyValueTable data-testid="validator-table-voting-power">
              <KeyValueTableRow>
                <span>{t('UNNORMALISED VOTING POWER')}</span>

                <Tooltip description={t('UnnormalisedVotingPowerDescription')}>
                  <span data-testid="unnormalised-voting-power">
                    {getUnnormalisedVotingPower(rawValidatorScore)}
                  </span>
                </Tooltip>
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={true}>
                <span>
                  <strong>{t('NORMALISED VOTING POWER')}</strong>
                </span>

                <Tooltip description={t('NormalisedVotingPowerDescription')}>
                  <strong data-testid="normalised-voting-power">
                    {getNormalisedVotingPower(node.rankingScore.votingPower)}
                  </strong>
                </Tooltip>
              </KeyValueTableRow>
            </KeyValueTable>
          </RoundedWrapper>
        </div>
      </div>
    </>
  );
};
