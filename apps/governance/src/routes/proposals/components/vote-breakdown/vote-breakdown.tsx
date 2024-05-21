import compact from 'lodash/compact';
import countBy from 'lodash/countBy';
import { useState, type ReactNode } from 'react';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import { Trans, useTranslation } from 'react-i18next';
import { useVoteInformation } from '../../hooks';
import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '@vegaprotocol/utils';
import {
  ProposalRejectionReasonMapping,
  ProposalState,
} from '@vegaprotocol/types';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import { type Proposal, type BatchProposal } from '../../types';
import {
  type ProposalTermsFieldsFragment,
  type VoteFieldsFragment,
} from '../../__generated__/Proposals';
import { useBatchVoteInformation } from '../../hooks/use-vote-information';
import { MarketName } from '../proposal/market-name';
import { Indicator } from '../proposal/indicator';
import { type ProposalNode } from '../proposal/proposal-utils';

export const CompactVotes = ({ number }: { number: BigNumber }) => (
  <CompactNumber
    number={number}
    decimals={number.isGreaterThan(1000) ? 1 : 0}
    compactAbove={1000}
    compactDisplay="short"
  />
);

interface VoteProgressProps {
  percentageFor: BigNumber;
  colourfulBg?: boolean;
  testId?: string;
  children?: ReactNode;
}

const VoteProgress = ({
  percentageFor,
  colourfulBg,
  testId,
  children,
}: VoteProgressProps) => {
  const containerClasses = classNames(
    'relative h-2 rounded-md overflow-hidden',
    // 'border border-vega-dark-300',
    colourfulBg ? 'bg-vega-red' : 'bg-vega-dark-200'
  );

  const progressClasses = classNames(
    'absolute h-full top-0 left-0',
    colourfulBg ? 'bg-vega-green' : 'bg-white'
  );

  const textClasses = classNames(
    'w-full flex items-center justify-start text-white text-sm pb-1'
  );

  return (
    <div>
      <div className={textClasses}>{children}</div>
      <div className={containerClasses}>
        <div
          className={progressClasses}
          style={{ width: `${percentageFor}%` }}
          data-testid={testId}
        />
      </div>
    </div>
  );
};

interface StatusProps {
  reached: boolean;
  threshold: BigNumber;
  text: string;
  testId?: string;
}

const Status = ({ reached, threshold, text, testId }: StatusProps) => {
  const { t } = useTranslation();

  return (
    <div data-testid={testId}>
      {reached ? (
        <div className="flex items-center gap-2">
          <VegaIcon
            name={VegaIconNames.TICK}
            className="text-vega-green"
            size={20}
          />
          <span>
            {threshold.toString()}% {text} {t('met')}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <VegaIcon
            name={VegaIconNames.CROSS}
            className="text-vega-red"
            size={20}
          />
          <span>
            {threshold.toString()}% {text} {t('not met')}
          </span>
        </div>
      )}
    </div>
  );
};

export const VoteBreakdown = ({
  proposal,
  restData,
}: {
  proposal: Proposal | BatchProposal;
  restData?: ProposalNode | null;
}) => {
  if (proposal.__typename === 'Proposal') {
    return <VoteBreakdownNormal proposal={proposal} />;
  }

  if (proposal.__typename === 'BatchProposal') {
    return <VoteBreakdownBatch proposal={proposal} restData={restData} />;
  }

  return null;
};

const VoteBreakdownBatch = ({
  proposal,
  restData,
}: {
  proposal: BatchProposal;
  restData?: ProposalNode | null;
}) => {
  const [fullBreakdown, setFullBreakdown] = useState(false);
  const { t } = useTranslation();

  const yesELS =
    restData?.yes?.reduce((all, y) => {
      if (y.elsPerMarket) {
        y.elsPerMarket.forEach((item) => {
          const share = Number(item.els);
          if (all[item.marketId]) {
            all[item.marketId].push(share);
          } else {
            all[item.marketId] = [share];
          }
          return all;
        });
      }
      return all;
    }, {} as Record<string, number[]>) || {};

  const noELS =
    restData?.no?.reduce((all, y) => {
      if (y.elsPerMarket) {
        y.elsPerMarket.forEach((item) => {
          const share = Number(item.els);
          if (all[item.marketId]) {
            all[item.marketId].push(share);
          } else {
            all[item.marketId] = [share];
          }
          return all;
        });
      }
      return all;
    }, {} as Record<string, number[]>) || {};

  const voteInfo = useBatchVoteInformation({
    terms: compact(
      proposal.subProposals ? proposal.subProposals.map((p) => p?.terms) : []
    ),
    votes: proposal.votes,
  });

  if (!voteInfo) return null;

  const batchWillPass = voteInfo.every((i) => i.willPass);

  const passingCount = countBy(voteInfo, (v) => v.willPass);

  if (proposal.state === ProposalState.STATE_OPEN) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {batchWillPass ? (
            <p className="flex gap-2 m-0 items-center">
              <VegaIcon
                name={VegaIconNames.TICK}
                className="text-vega-green"
                size={20}
              />
              {t(
                'Currently expected to pass: conditions met for {{count}} of {{total}} proposals',
                {
                  count: passingCount['true'] || 0,
                  total: voteInfo.length,
                }
              )}
            </p>
          ) : (
            <p className="flex gap-2 m-0 items-center">
              <VegaIcon
                name={VegaIconNames.CROSS}
                className="text-vega-red"
                size={20}
              />
              {t(
                'Currently expected to fail: {{count}} of {{total}} proposals are passing',
                {
                  count: passingCount['true'] || 0,
                  total: voteInfo.length,
                }
              )}
            </p>
          )}
          <button
            className="underline"
            onClick={() => setFullBreakdown((x) => !x)}
          >
            {fullBreakdown ? 'Hide vote breakdown' : 'Show vote breakdown'}
          </button>
        </div>
        {fullBreakdown && (
          <div>
            {proposal.subProposals?.map((p, i) => {
              if (!p?.terms) return null;
              return (
                <VoteBreakdownBatchSubProposal
                  indicator={i + 1}
                  key={i}
                  proposal={proposal}
                  votes={proposal.votes}
                  terms={p.terms}
                  yesELS={yesELS}
                  noELS={noELS}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (
    proposal.state === ProposalState.STATE_DECLINED ||
    proposal.state === ProposalState.STATE_PASSED
  ) {
    let description = t(
      'Proposal passed: conditions met for {{count}} of {{total}} proposals',
      {
        count: passingCount['true'] || 0,
        total: voteInfo.length,
      }
    );
    let descriptionIconColor = 'text-vega-green';
    if (proposal.__typename === 'BatchProposal') {
      const subStates = compact(
        proposal?.subProposals?.map((sub) => sub?.state)
      );
      const subPassed = subStates.filter(
        (s) =>
          s === ProposalState.STATE_PASSED || s === ProposalState.STATE_ENACTED
      );
      if (subPassed.length !== subStates.length) {
        description = t(
          'Proposal passed: conditions met for {{count}} of {{total}} proposals, but some proposals failed in execution',
          {
            count: passingCount['true'] || 0,
            total: voteInfo.length,
          }
        );
        descriptionIconColor = 'text-vega-yellow';
      }
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {batchWillPass ? (
            <p className="flex gap-2 m-0 items-center">
              <VegaIcon
                name={VegaIconNames.TICK}
                className={descriptionIconColor}
                size={20}
              />
              {description}
            </p>
          ) : (
            <p className="flex gap-2 m-0 items-center">
              <VegaIcon
                name={VegaIconNames.CROSS}
                className="text-vega-red"
                size={20}
              />
              {t('Proposal failed: {{count}} of {{total}} proposals passed', {
                count: passingCount['true'] || 0,
                total: voteInfo.length,
              })}
            </p>
          )}
          <button
            className="underline"
            onClick={() => setFullBreakdown((x) => !x)}
          >
            {fullBreakdown ? 'Hide vote breakdown' : 'Show vote breakdown'}
          </button>
        </div>
        {fullBreakdown && (
          <div>
            {proposal.subProposals?.map((p, i) => {
              if (!p?.terms) return null;
              return (
                <VoteBreakdownBatchSubProposal
                  indicator={i + 1}
                  key={i}
                  proposal={proposal}
                  votes={proposal.votes}
                  terms={p.terms}
                  yesELS={yesELS}
                  noELS={noELS}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const VoteBreakdownBatchSubProposal = ({
  proposal,
  votes,
  terms,
  indicator,
  yesELS,
  noELS,
}: {
  proposal: BatchProposal;
  votes: VoteFieldsFragment;
  terms: ProposalTermsFieldsFragment;
  indicator?: number;
  yesELS: Record<string, number[]>;
  noELS: Record<string, number[]>;
}) => {
  const { t } = useTranslation();

  const isProposalOpen = proposal?.state === ProposalState.STATE_OPEN;
  const isUpdateMarket =
    terms?.change?.__typename === 'UpdateMarket' ||
    terms?.change.__typename === 'UpdateSpotMarket';

  let marketId = undefined;
  if (
    terms?.change?.__typename === 'UpdateMarket' ||
    terms?.change?.__typename === 'UpdateSpotMarket'
  ) {
    marketId = terms.change.marketId;
  }
  if (terms?.change?.__typename === 'UpdateMarketState') {
    marketId = terms.change.market.id;
  }
  if (
    (terms?.change?.__typename === 'NewMarket' ||
      terms?.change?.__typename === 'NewSpotMarket') &&
    indicator &&
    proposal?.subProposals &&
    proposal?.subProposals.length > 0
  ) {
    marketId = proposal.subProposals?.[indicator - 1]?.id;
  }

  const voteInfo = useVoteInformation({
    votes,
    terms,
    // yes votes ELS for this specific proposal (market)
    yesELS: marketId ? yesELS[marketId] : undefined,
    // no votes ELS for this specific proposal (market)
    noELS: marketId ? noELS[marketId] : undefined,
  });

  const marketName = marketId ? (
    <>
      : <MarketName marketId={marketId} />
    </>
  ) : null;

  const indicatorElement = indicator && <Indicator indicator={indicator} />;

  const errorDetails = indicator
    ? proposal?.subProposals?.[indicator - 1]?.errorDetails || undefined
    : undefined;
  const rejectionReason = indicator
    ? proposal?.subProposals?.[indicator - 1]?.rejectionReason || undefined
    : undefined;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        {indicatorElement}
        <h4>
          {t(terms.change.__typename)} {marketName}
        </h4>
      </div>
      <div className="rounded-sm bg-vega-dark-100 p-3">
        <VoteBreakDownUI
          voteInfo={voteInfo}
          isProposalOpen={isProposalOpen}
          isUpdateMarket={isUpdateMarket}
        />
      </div>
      {errorDetails ? (
        <div className="rounded-sm bg-vega-red-600 text-white text-xs p-1 mt-1">
          {rejectionReason
            ? `${ProposalRejectionReasonMapping[rejectionReason]}: `
            : null}{' '}
          {errorDetails}
        </div>
      ) : null}
    </div>
  );
};

const VoteBreakdownNormal = ({ proposal }: { proposal: Proposal }) => {
  const voteInfo = useVoteInformation({
    votes: proposal.votes,
    terms: proposal.terms,
  });

  const isProposalOpen = proposal?.state === ProposalState.STATE_OPEN;
  const isUpdateMarket =
    proposal?.terms?.change?.__typename === 'UpdateMarket' ||
    proposal?.terms?.change?.__typename === 'UpdateSpotMarket';

  return (
    <div className="mb-6">
      <VoteBreakDownUI
        voteInfo={voteInfo}
        isProposalOpen={isProposalOpen}
        isUpdateMarket={isUpdateMarket}
      />
    </div>
  );
};

const VoteBreakDownUI = ({
  voteInfo,
  isProposalOpen,
  isUpdateMarket,
}: {
  voteInfo: ReturnType<typeof useVoteInformation>;
  isProposalOpen: boolean;
  isUpdateMarket: boolean;
}) => {
  const defaultDP = 2;

  const { t } = useTranslation();

  if (!voteInfo) return null;

  const {
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    totalLPTokensPercentage,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesTokens,
    noTokens,
    totalEquityLikeShareWeight,
    requiredMajorityPercentage,
    requiredMajorityLPPercentage,
    requiredParticipation,
    requiredParticipationLP,
    participationLPMet,
    majorityMet,
    majorityLPMet,
    willPassByTokenVote,
    willPassByLPVote,
    lpVoteWeight,
  } = voteInfo;

  const participationThresholdProgress = BigNumber.min(
    totalTokensPercentage.dividedBy(requiredParticipation).multipliedBy(100),
    new BigNumber(100)
  );
  const lpParticipationThresholdProgress =
    requiredParticipationLP &&
    BigNumber.min(
      totalLPTokensPercentage
        .dividedBy(requiredParticipationLP)
        .multipliedBy(100),
      new BigNumber(100)
    );

  const willPass = willPassByTokenVote || willPassByLPVote;
  const updateMarketVotePassMethod = willPassByTokenVote
    ? t('byTokenVote')
    : t('byLiquidityVote');

  const sectionWrapperClasses = classNames(
    'flex justify-between flex-wrap gap-6'
  );
  const sectionClasses = classNames('min-w-[300px] flex-1 flex-grow');
  const headingClasses = classNames('mb-2 text-sm text-white font-bold');
  const progressDetailsClasses = classNames(
    'flex justify-between flex-wrap mt-2 text-sm'
  );

  return (
    <div>
      {isProposalOpen && (
        <div
          data-testid="vote-status"
          className="flex items-center gap-2 mb-2 text-bold"
        >
          <span>
            {willPass ? (
              <VegaIcon
                name={VegaIconNames.TICK}
                size={20}
                className="text-vega-green"
              />
            ) : (
              <VegaIcon
                name={VegaIconNames.CROSS}
                size={20}
                className="text-vega-red"
              />
            )}
          </span>
          {willPass ? (
            <p className="m-0">
              <Trans
                i18nKey={'Currently expected to <0>pass</0>'}
                components={[<span className="text-vega-green" />]}
              />
              {isUpdateMarket && <span> {updateMarketVotePassMethod}</span>}
            </p>
          ) : (
            <p className="m-0">
              <Trans
                i18nKey={'Currently expected to <0>fail</0>'}
                components={[<span className="text-vega-red" />]}
              />
            </p>
          )}
        </div>
      )}

      {isUpdateMarket && <h3 className={headingClasses}>{t('tokenVote')}</h3>}
      <div className={sectionWrapperClasses}>
        <section
          className={sectionClasses}
          data-testid="token-majority-breakdown"
        >
          <VoteProgress
            percentageFor={yesPercentage}
            colourfulBg={true}
            testId="token-majority-progress"
          >
            <Status
              reached={majorityMet}
              threshold={requiredMajorityPercentage}
              text={t('majorityThreshold')}
              testId={
                majorityMet ? 'token-majority-met' : 'token-majority-not-met'
              }
            />
          </VoteProgress>

          <div className={progressDetailsClasses}>
            <div className="flex items-center gap-1">
              <span>{t('tokenVotesFor')}:</span>
              <Tooltip description={formatNumber(yesTokens, defaultDP)}>
                <button data-testid="num-votes-for">
                  <CompactVotes number={yesTokens} />
                </button>
              </Tooltip>
              <span>
                (
                <Tooltip
                  description={<span>{yesPercentage.toFixed(defaultDP)}%</span>}
                >
                  <button data-testid="votes-for-percentage">
                    {yesPercentage.toFixed(0)}%
                  </button>
                </Tooltip>
                )
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span>{t('tokenVotesAgainst')}:</span>
              <Tooltip description={formatNumber(noTokens, defaultDP)}>
                <button data-testid="num-votes-against">
                  <CompactVotes number={noTokens} />
                </button>
              </Tooltip>
              <span>
                (
                <Tooltip
                  description={<span>{noPercentage.toFixed(defaultDP)}%</span>}
                >
                  <button data-testid="votes-against-percentage">
                    {noPercentage.toFixed(0)}%
                  </button>
                </Tooltip>
                )
              </span>
            </div>
          </div>
        </section>

        <section
          className={sectionClasses}
          data-testid="token-participation-breakdown"
        >
          <VoteProgress
            percentageFor={participationThresholdProgress}
            testId="token-participation-progress"
          >
            <Status
              reached={participationMet}
              threshold={requiredParticipation}
              text={t('participationThreshold')}
              testId={
                participationMet
                  ? 'token-participation-met'
                  : 'token-participation-not-met'
              }
            />
          </VoteProgress>

          <div className="flex mt-2 text-sm">
            <div className="flex items-center gap-1">
              <span>{t('totalTokensVoted')}:</span>
              <Tooltip description={formatNumber(totalTokensVoted, defaultDP)}>
                <button data-testid="total-voted">
                  <CompactVotes number={totalTokensVoted} />
                </button>
              </Tooltip>
              <span data-testid="total-voted-percentage">
                ({totalTokensPercentage.toFixed(defaultDP)}%)
              </span>
            </div>
          </div>
        </section>
      </div>

      {/** Liquidity provider vote */}
      {isUpdateMarket && (
        <div className="mt-3">
          <h3 className={headingClasses}>{t('liquidityProviderVote')}</h3>
          <div className={sectionWrapperClasses}>
            <section
              className={sectionClasses}
              data-testid="lp-majority-breakdown"
            >
              <VoteProgress
                percentageFor={lpVoteWeight}
                colourfulBg={true}
                testId="lp-majority-progress"
              >
                <Status
                  reached={majorityLPMet}
                  threshold={requiredMajorityLPPercentage}
                  text={t('majorityThreshold')}
                  testId={
                    majorityLPMet ? 'lp-majority-met' : 'lp-majority-not-met'
                  }
                />
              </VoteProgress>

              <div className={progressDetailsClasses}>
                <div className="flex items-center gap-1">
                  <span>{t('liquidityProviderVotesFor')}:</span>
                  <Tooltip
                    description={
                      <span>{lpVoteWeight.toFixed(defaultDP)}%</span>
                    }
                  >
                    <button>{lpVoteWeight.toFixed(1)}%</button>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-1">
                  <span>{t('liquidityProviderVotesAgainst')}:</span>
                  <span>
                    <Tooltip
                      description={
                        <span>{noLPPercentage.toFixed(defaultDP)}%</span>
                      }
                    >
                      <button>{noLPPercentage.toFixed(1)}%</button>
                    </Tooltip>
                  </span>
                </div>
              </div>
            </section>

            <section
              className={sectionClasses}
              data-testid="lp-participation-breakdown"
            >
              <VoteProgress
                percentageFor={
                  lpParticipationThresholdProgress || new BigNumber(0)
                }
                testId="lp-participation-progress"
              >
                <Status
                  reached={participationLPMet}
                  threshold={requiredParticipationLP || new BigNumber(1)}
                  text={t('participationThreshold')}
                  testId={
                    participationLPMet
                      ? 'lp-participation-met'
                      : 'lp-participation-not-met'
                  }
                />
              </VoteProgress>

              <div className="flex mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <span>{t('totalLiquidityProviderTokensVoted')}:</span>
                  <Tooltip
                    description={formatNumber(
                      totalEquityLikeShareWeight,
                      defaultDP
                    )}
                  >
                    <span>{totalEquityLikeShareWeight.toFixed(1)}%</span>
                  </Tooltip>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
