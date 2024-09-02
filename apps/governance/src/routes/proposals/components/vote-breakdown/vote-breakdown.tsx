import compact from 'lodash/compact';
import { cn } from '@vegaprotocol/ui-toolkit';
import { type ReactNode } from 'react';
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
import { useBatchVoteInformation } from '../../hooks/use-vote-information';
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
  const containerClasses = cn(
    'relative h-2 rounded-md overflow-hidden',
    colourfulBg ? 'bg-red' : 'bg-surface-200'
  );

  const progressClasses = cn(
    'absolute h-full top-0 left-0',
    colourfulBg ? 'bg-green' : 'bg-white'
  );

  const textClasses = cn(
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
            className="text-green"
            size={20}
          />
          <span>
            {threshold.toString()}% {text} {t('met')}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <VegaIcon name={VegaIconNames.CROSS} className="text-red" size={20} />
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
    return <VoteBreakdownNormal proposal={proposal} restData={restData} />;
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
  const { t } = useTranslation();

  const voteInfo = useBatchVoteInformation({
    votes: proposal.votes,
    restData,
  });

  if (!voteInfo) return null;

  if (proposal.state === ProposalState.STATE_OPEN) {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-sm bg-gs-100 p-3">
          <VoteBreakDownUI
            voteInfo={voteInfo}
            isProposalOpen={true}
            isUpdateMarket={false}
          />
        </div>
      </div>
    );
  } else if (
    proposal.state === ProposalState.STATE_DECLINED ||
    proposal.state === ProposalState.STATE_PASSED
  ) {
    let description = t('Proposal passed');
    let descriptionIconColor = 'text-green';
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
          'Proposal passed: conditions met for some proposals, but some proposals failed in execution'
        );
        descriptionIconColor = 'text-yellow';
      }
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {voteInfo.willPass ? (
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
                className="text-red"
                size={20}
              />
              {t('Proposal failed')}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="rounded-sm bg-vega-dark-100 p-3">
            <VoteBreakDownUI
              voteInfo={voteInfo}
              isProposalOpen={false}
              isUpdateMarket={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const VoteBreakdownNormal = ({
  proposal,
  restData,
}: {
  proposal: Proposal;
  restData?: ProposalNode | null;
}) => {
  const voteInfo = useVoteInformation({
    votes: proposal.votes,
    terms: proposal.terms,
    restData: restData,
  });

  const isProposalOpen = proposal?.state === ProposalState.STATE_OPEN;
  const isUpdateMarket =
    proposal?.terms?.change?.__typename === 'UpdateMarket' ||
    proposal?.terms?.change?.__typename === 'UpdateSpotMarket';

  const errorDetails = proposal.errorDetails;
  const rejectionReason = proposal.rejectionReason;

  return (
    <div className="mb-6">
      <VoteBreakDownUI
        voteInfo={voteInfo}
        isProposalOpen={isProposalOpen}
        isUpdateMarket={isUpdateMarket}
      />
      {errorDetails ? (
        <div className="rounded-sm bg-red-600 text-white text-xs p-1 mt-1">
          {rejectionReason
            ? `${ProposalRejectionReasonMapping[rejectionReason]}: `
            : null}{' '}
          {errorDetails}
        </div>
      ) : null}
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

  const sectionWrapperClasses = cn('flex justify-between flex-wrap gap-6');
  const sectionClasses = cn('min-w-[300px] flex-1 flex-grow');
  const headingClasses = cn('mb-2 text-sm text-white font-bold');
  const progressDetailsClasses = cn(
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
                className="text-green"
              />
            ) : (
              <VegaIcon
                name={VegaIconNames.CROSS}
                size={20}
                className="text-red"
              />
            )}
          </span>
          {willPass ? (
            <p className="m-0">
              <Trans
                i18nKey={'Currently expected to <0>pass</0>'}
                components={[<span className="text-green" />]}
              />
              {isUpdateMarket && <span> {updateMarketVotePassMethod}</span>}
            </p>
          ) : (
            <p className="m-0">
              <Trans
                i18nKey={'Currently expected to <0>fail</0>'}
                components={[<span className="text-red" />]}
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
