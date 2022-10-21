import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../../lib/format-number';
import { ConnectToVega } from '../../../../components/connect-to-vega';
import { useVoteInformation } from '../../hooks';
import { useUserVote } from './use-user-vote';
import { VoteButtonsContainer } from './vote-buttons';
import { VoteProgress } from './vote-progress';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalType } from '../proposal/proposal';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';

interface VoteDetailsProps {
  proposal: Proposal_proposal;
  minVoterBalance: string | null;
  spamProtectionMinTokens: string | null;
  proposalType: ProposalType | null;
}

export const VoteDetails = ({
  proposal,
  minVoterBalance,
  spamProtectionMinTokens,
  proposalType,
}: VoteDetailsProps) => {
  const { pubKey } = useVegaWallet();
  const {
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
    yesTokens,
    noTokens,
    requiredMajorityPercentage,
    requiredMajorityLPPercentage,
    requiredParticipation,
  } = useVoteInformation({ proposal });

  const { t } = useTranslation();
  const { voteState, voteDatetime, castVote } = useUserVote(
    proposal.id,
    proposal.votes.yes.votes,
    proposal.votes.no.votes
  );

  const defaultDecimals = 2;

  return (
    <>
      {proposalType === ProposalType.PROPOSAL_UPDATE_MARKET && (
        <section>
          <h3 className="text-xl mb-2">{t('liquidityVotes')}</h3>
          <table className="w-full mb-8">
            <thead>
              <tr>
                <th className="text-vega-green w-[18%] text-left">
                  {t('for')}
                </th>
                <th>
                  <VoteProgress
                    threshold={requiredMajorityLPPercentage}
                    progress={yesLPPercentage}
                  />
                </th>
                <th className="text-danger w-[18%] text-right">
                  {t('against')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="text-left"
                  data-testid="vote-progress-indicator-percentage-for"
                >
                  {yesLPPercentage.toFixed(defaultDecimals)}%
                </td>
                <td className="text-center text-white">
                  {t('majorityRequired')}{' '}
                  {requiredMajorityLPPercentage.toFixed(defaultDecimals)}%
                </td>
                <td
                  className="text-right"
                  data-testid="vote-progress-indicator-percentage-against"
                >
                  {noLPPercentage.toFixed(defaultDecimals)}%
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}
      <section>
        <h3 className="text-xl mb-2">{t('tokenVotes')}</h3>
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th className="text-vega-green w-[18%] text-left">{t('for')}</th>
              <th>
                <VoteProgress
                  threshold={requiredMajorityPercentage}
                  progress={yesPercentage}
                />
              </th>
              <th className="text-danger w-[18%] text-right">{t('against')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="text-left"
                data-testid="vote-progress-indicator-percentage-for"
              >
                {yesPercentage.toFixed(defaultDecimals)}%
              </td>
              <td className="text-center text-white">
                {t('majorityRequired')}{' '}
                {requiredMajorityPercentage.toFixed(defaultDecimals)}%
              </td>
              <td
                className="text-right"
                data-testid="vote-progress-indicator-percentage-against"
              >
                {noPercentage.toFixed(defaultDecimals)}%
              </td>
            </tr>
            <tr>
              <td data-testid="vote-progress-indicator-tokens-for">
                {' '}
                {formatNumber(yesTokens, defaultDecimals)}{' '}
              </td>
              <td></td>
              <td
                data-testid="vote-progress-indicator-tokens-against"
                className="text-right"
              >
                {formatNumber(noTokens, defaultDecimals)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mb-6">
          {t('participation')}
          {': '}
          {participationMet ? (
            <span className="text-vega-green mx-4">{t('met')}</span>
          ) : (
            <span className="text-danger mx-4">{t('notMet')}</span>
          )}{' '}
          {formatNumber(totalTokensVoted, defaultDecimals)}{' '}
          {formatNumber(totalTokensPercentage, defaultDecimals)}%
          <span className="ml-4">
            ({formatNumber(requiredParticipation, defaultDecimals)}%{' '}
            {t('governanceRequired')})
          </span>
        </p>
        {proposalType === ProposalType.PROPOSAL_UPDATE_MARKET && (
          <p>{t('votingThresholdInfo')}</p>
        )}
        {pubKey ? (
          <>
            <h3 className="text-xl mb-2">{t('yourVote')}</h3>
            <VoteButtonsContainer
              voteState={voteState}
              castVote={castVote}
              voteDatetime={voteDatetime}
              proposalState={proposal.state}
              minVoterBalance={minVoterBalance}
              spamProtectionMinTokens={spamProtectionMinTokens}
              className="flex"
            />
          </>
        ) : (
          <ConnectToVega />
        )}
      </section>
    </>
  );
};
