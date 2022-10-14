import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '../../../../lib/format-number';
import { ConnectToVega } from '../../../../components/connect-to-vega/connect-to-vega';
import { useVoteInformation } from '../../hooks';
import { CurrentProposalStatus } from '../current-proposal-status';
import { useUserVote } from './use-user-vote';
import { VoteButtonsContainer } from './vote-buttons';
import { VoteProgress } from './vote-progress';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalState } from '@vegaprotocol/types';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';

interface VoteDetailsProps {
  proposal: Proposal_proposal;
}

export const VoteDetails = ({ proposal }: VoteDetailsProps) => {
  const { pubKey } = useVegaWallet();
  const {
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    yesTokens,
    noTokens,
    requiredMajorityPercentage,
    requiredParticipation,
  } = useVoteInformation({ proposal });

  const { t } = useTranslation();
  const { voteState, voteDatetime, castVote } = useUserVote(
    proposal.id,
    proposal.votes.yes.votes,
    proposal.votes.no.votes
  );

  const defaultDecimals = 2;
  const daysLeft = t('daysLeft', {
    daysLeft: formatDistanceToNow(new Date(proposal.terms.closingDatetime)),
  });

  return (
    <section>
      <h3 className="text-xl mb-2">{t('votes')}</h3>
      <p>
        <span>
          <CurrentProposalStatus proposal={proposal} />
        </span>
        {'. '}
        {proposal.state === ProposalState.STATE_OPEN ? daysLeft : null}
      </p>
      <table className="w-full">
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
      <p>
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
      {pubKey ? (
        <>
          <h3 className="text-xl mb-2">{t('yourVote')}</h3>
          <VoteButtonsContainer
            voteState={voteState}
            castVote={castVote}
            voteDatetime={voteDatetime}
            proposalState={proposal.state}
            className="flex"
          />
        </>
      ) : (
        <ConnectToVega />
      )}
    </section>
  );
};
