import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useVoteInformation } from '../../hooks';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { ProposalState } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface VoteBreakdownProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}

interface VoteProgressProps {
  percentageFor: BigNumber;
  colourful?: boolean;
  children?: ReactNode;
}

const VoteProgress = ({
  percentageFor,
  colourful,
  children,
}: VoteProgressProps) => {
  const containerClasses = classNames(
    'relative h-10 rounded-md border border-vega-dark-300 overflow-hidden',
    colourful ? 'bg-vega-pink' : 'bg-vega-dark-400'
  );

  const progressClasses = classNames(
    'absolute h-full top-0 left-0',
    colourful ? 'bg-vega-green' : 'bg-white'
  );

  const textClasses = classNames(
    'absolute top-0 left-4 w-full h-full flex items-center justify-start text-black'
  );

  return (
    <div className={containerClasses}>
      <div
        className={progressClasses}
        style={{ width: `${percentageFor}%` }}
      ></div>
      <div className={textClasses}>{children}</div>
    </div>
  );
};

interface StatusProps {
  reached: boolean;
  threshold: BigNumber;
  text: string;
}

const Status = ({ reached, threshold, text }: StatusProps) => {
  const { t } = useTranslation();

  return reached ? (
    <div className="flex items-center gap-2">
      <Icon name="tick" />
      <span>
        {threshold.toString()}% {text} {t('met')}
      </span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Icon name="cross" />
      <span>
        {threshold.toString()}% {text} {t('not met')}
      </span>
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
    yesEquityLikeShareWeight,
    noEquityLikeShareWeight,
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
  const willPass = willPassByTokenVote || willPassByLPVote;
  const updateMarketVotePassMethod = willPassByTokenVote
    ? t('byTokenVote')
    : t('byLiquidityVote');

  const sectionWrapperClasses = classNames('grid sm:grid-cols-2 gap-6');
  const headingClasses = classNames('mb-2 text-vega-dark-400');
  const progressDetailsClasses = classNames(
    'flex justify-between flex-wrap mt-2 text-sm'
  );

  return (
    <>
      {isProposalOpen && (
        <div data-testid="proposal-pass-method" className="mb-4">
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
      {isUpdateMarket && <h3 className={headingClasses}>{t('tokenVote')}</h3>}
      <div className={sectionWrapperClasses}>
        <section data-testid="token-majority-breakdown">
          <VoteProgress percentageFor={yesPercentage} colourful={true}>
            <Status
              reached={majorityMet}
              threshold={requiredMajorityPercentage}
              text={t('majorityThreshold')}
            />
          </VoteProgress>

          <div className={progressDetailsClasses}>
            <div className="flex items-center gap-1">
              <span>{t('tokenVotesFor')}:</span>
              <Tooltip description={formatNumber(yesTokens, defaultDP)}>
                <button>
                  {yesTokens.dividedBy(toBigNum(10 ** 6, 0)).toFixed(1)}M
                </button>
              </Tooltip>
              <span>
                (
                <Tooltip
                  description={<span>{yesPercentage.toFixed(defaultDP)}%</span>}
                >
                  <button>{yesPercentage.toFixed(0)}%</button>
                </Tooltip>
                )
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span>{t('tokenVotesAgainst')}:</span>
              <Tooltip description={formatNumber(noTokens, defaultDP)}>
                <button>
                  {noTokens.dividedBy(toBigNum(10 ** 6, 0)).toFixed(1)}M
                </button>
              </Tooltip>
              <span>
                (
                <Tooltip
                  description={<span>{noPercentage.toFixed(defaultDP)}%</span>}
                >
                  <button>{noPercentage.toFixed(0)}%</button>
                </Tooltip>
                )
              </span>
            </div>
          </div>
        </section>

        <section data-testid="token-participation-breakdown">
          <VoteProgress percentageFor={totalTokensPercentage}>
            <Status
              reached={participationMet}
              threshold={requiredParticipation}
              text={t('participationThreshold')}
            />
          </VoteProgress>

          <div className="flex mt-2 text-sm">
            <div className="flex items-center gap-1">
              <span>{t('totalTokensVoted')}:</span>
              <Tooltip description={formatNumber(totalTokensVoted, defaultDP)}>
                <button>
                  {totalTokensVoted.dividedBy(toBigNum(10 ** 6, 0)).toFixed(1)}M
                </button>
              </Tooltip>
              <span>({totalTokensPercentage.toFixed(defaultDP)}%)</span>
            </div>
          </div>
        </section>
      </div>

      {isUpdateMarket && (
        <div className="mt-4">
          <h3 className={headingClasses}>{t('liquidityProviderVote')}</h3>
          <div className={sectionWrapperClasses}>
            <section data-testid="lp-majority-breakdown">
              <VoteProgress percentageFor={yesLPPercentage} colourful={true}>
                <Status
                  reached={majorityLPMet}
                  threshold={requiredMajorityLPPercentage}
                  text={t('majorityThreshold')}
                />
              </VoteProgress>

              <div className={progressDetailsClasses}>
                <div className="flex items-center gap-1">
                  <span>{t('liquidityProviderVotesFor')}:</span>
                  <Tooltip
                    description={formatNumber(
                      yesEquityLikeShareWeight,
                      defaultDP
                    )}
                  >
                    <button>
                      {yesEquityLikeShareWeight
                        .dividedBy(toBigNum(10 ** 6, 0))
                        .toFixed(1)}
                      M
                    </button>
                  </Tooltip>
                  <span>
                    (
                    <Tooltip
                      description={
                        <span>{yesLPPercentage.toFixed(defaultDP)}%</span>
                      }
                    >
                      <button>{yesLPPercentage.toFixed(0)}%</button>
                    </Tooltip>
                    )
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span>{t('liquidityProviderVotesAgainst')}:</span>
                  <Tooltip
                    description={formatNumber(
                      noEquityLikeShareWeight,
                      defaultDP
                    )}
                  >
                    <button>
                      {noEquityLikeShareWeight
                        .dividedBy(toBigNum(10 ** 6, 0))
                        .toFixed(1)}
                      M
                    </button>
                  </Tooltip>
                  <span>
                    (
                    <Tooltip
                      description={
                        <span>{noLPPercentage.toFixed(defaultDP)}%</span>
                      }
                    >
                      <button>{noLPPercentage.toFixed(0)}%</button>
                    </Tooltip>
                    )
                  </span>
                </div>
              </div>
            </section>

            <section data-testid="lp-participation-breakdown">
              <VoteProgress percentageFor={totalLPTokensPercentage}>
                <Status
                  reached={participationLPMet}
                  threshold={requiredParticipationLP || new BigNumber(1)}
                  text={t('participationThreshold')}
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
                    <button>
                      {totalEquityLikeShareWeight
                        .dividedBy(toBigNum(10 ** 6, 0))
                        .toFixed(1)}
                      M
                    </button>
                  </Tooltip>
                  <span>
                    ({totalEquityLikeShareWeight.toFixed(defaultDP)}%)
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};
