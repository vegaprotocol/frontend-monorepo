import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { ProposalState } from '../../../../__generated__/globalTypes';
import { formatNumber } from '../../../../lib/format-number';
import { ConnectToVega } from '../../../staking/connect-to-vega';
import { useVoteInformation } from '../../hooks';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';
import { CurrentProposalStatus } from '../current-proposal-status';
import { useUserVote } from './use-user-vote';
import { VoteButtonsContainer } from './vote-buttons';
import { VoteProgress } from './vote-progress';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface VoteDetailsProps {
  proposal: Proposal_proposal;
}

export const VoteDetails = ({ proposal }: VoteDetailsProps) => {
  const { keypair } = useVegaWallet();
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
      <h3>{t('votes')}</h3>
      <p className="mb-0">
        <span>
          <CurrentProposalStatus proposal={proposal} />
        </span>
        .&nbsp;
        {proposal.state === ProposalState.Open ? daysLeft : null}
      </p>
      <table className="w-full font-normal">
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
            <td className="text-left">
              {yesPercentage.toFixed(defaultDecimals)}%
            </td>
            <td className="text-center text-white">
              {t('majorityRequired')}{' '}
              {requiredMajorityPercentage.toFixed(defaultDecimals)}%
            </td>
            <td className="text-right">
              {noPercentage.toFixed(defaultDecimals)}%
            </td>
          </tr>
          <tr>
            <td className="text-white-60">
              {' '}
              {formatNumber(yesTokens, defaultDecimals)}
            </td>
            <td></td>
            <td className="text-white-60">
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
        <span className="ml-4 text-white-60">
          ({formatNumber(requiredParticipation, defaultDecimals)}%{' '}
          {t('governanceRequired')})
        </span>
      </p>
      {keypair ? (
        <>
          <h3>{t('yourVote')}</h3>
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
