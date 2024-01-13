import { type ReactNode } from 'react';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useVoteInformation } from '../../hooks';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '@vegaprotocol/utils';
import { ProposalState } from '@vegaprotocol/types';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import { type Proposal } from '../../types';

export const CompactVotes = ({ number }: { number: BigNumber }) => (
  <CompactNumber
    number={number}
    decimals={number.isGreaterThan(1000) ? 1 : 0}
    compactAbove={1000}
    compactDisplay="short"
  />
);

interface VoteBreakdownProps {
  proposal: Proposal;
}

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
    'relative h-10 rounded-md border border-vega-dark-300 overflow-hidden',
    colourfulBg ? 'bg-vega-pink' : 'bg-vega-dark-400'
  );

  const progressClasses = classNames(
    'absolute h-full top-0 left-0',
    colourfulBg ? 'bg-vega-green' : 'bg-white'
  );

  const textClasses = classNames(
    'absolute top-0 left-0 w-full h-full flex items-center justify-start px-3 text-black'
  );

  return (
    <div className={containerClasses}>
      <div
        className={progressClasses}
        style={{ width: `${percentageFor}%` }}
        data-testid={testId}
      ></div>
      <div className={textClasses}>{children}</div>
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
          <Icon name="tick" size={4} />
          <span>
            {threshold.toString()}% {text} {t('met')}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Icon name="cross" size={4} />
          <span>
            {threshold.toString()}% {text} {t('not met')}
          </span>
        </div>
      )}
    </div>
  );
};

export const VoteBreakdown = ({ proposal }: VoteBreakdownProps) => {
  const {
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    totalLPTokensPercentage,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
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
  } = useVoteInformation({ proposal });

  const { t } = useTranslation();
  const defaultDP = 2;
  const isProposalOpen = proposal?.state === ProposalState.STATE_OPEN;
  const isUpdateMarket = proposal?.terms?.change?.__typename === 'UpdateMarket';
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
  const headingClasses = classNames('mb-2 text-vega-dark-400');
  const progressDetailsClasses = classNames(
    'flex justify-between flex-wrap mt-2 text-sm'
  );

  return (
    <div className="mb-6">
      {isProposalOpen && (
        <div
          data-testid="vote-status"
          className="flex items-center gap-1 mb-2 text-bold"
        >
          <span>
            {willPass ? (
              <Icon name="tick" size={5} className="text-vega-green" />
            ) : (
              <Icon name="cross" size={5} className="text-vega-pink" />
            )}
          </span>
          <span>{t('currentlySetTo')} </span>
          {willPass ? (
            <span>
              <span className="text-vega-green">{t('pass')}</span>
              {isUpdateMarket && <span> {updateMarketVotePassMethod}</span>}
            </span>
          ) : (
            <span className="text-vega-pink">{t('fail')}</span>
          )}
        </div>
      )}

      {isUpdateMarket && (
        <div className="mb-4">
          <h3 className={headingClasses}>{t('liquidityProviderVote')}</h3>
          <div className={sectionWrapperClasses}>
            <section
              className={sectionClasses}
              data-testid="lp-majority-breakdown"
            >
              <VoteProgress
                percentageFor={yesLPPercentage}
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
                      <span>{yesLPPercentage.toFixed(defaultDP)}%</span>
                    }
                  >
                    <button>{yesLPPercentage.toFixed(1)}%</button>
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
    </div>
  );
};
