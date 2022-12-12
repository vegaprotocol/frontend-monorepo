import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalState } from '@vegaprotocol/types';
import { VoteProgress } from '@vegaprotocol/governance';
import { formatNumber } from '../../../../lib/format-number';
import { ConnectToVega } from '../../../../components/connect-to-vega';
import { useVoteInformation } from '../../hooks';
import { useUserVote } from './use-user-vote';
import { CurrentProposalStatus } from '../current-proposal-status';
import { VoteButtonsContainer } from './vote-buttons';
import { ProposalType } from '../proposal/proposal';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface VoteDetailsProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
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
  const { voteState, voteDatetime } = useUserVote(proposal?.id);
  const defaultDecimals = 2;
  const daysLeft = t('daysLeft', {
    daysLeft: formatDistanceToNow(new Date(proposal?.terms.closingDatetime)),
  });

  return (
    <>
      {proposalType === ProposalType.PROPOSAL_UPDATE_MARKET && (
        <section>
          <h3 className="text-xl mb-2">{t('liquidityVotes')}</h3>
          <p>
            <span>
              <CurrentProposalStatus proposal={proposal} />
            </span>
            {'. '}
            {proposal?.state === ProposalState.STATE_OPEN ? daysLeft : null}
          </p>
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
        <p>
          <span>
            <CurrentProposalStatus proposal={proposal} />
          </span>
          {'. '}
          {proposal?.state === ProposalState.STATE_OPEN ? daysLeft : null}
        </p>
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
            {proposal && (
              <VoteButtonsContainer
                voteState={voteState}
                voteDatetime={voteDatetime}
                proposalState={proposal.state}
                proposalId={proposal.id ?? ''}
                minVoterBalance={minVoterBalance}
                spamProtectionMinTokens={spamProtectionMinTokens}
                className="flex"
              />
            )}
          </>
        ) : (
          <ConnectToVega />
        )}
      </section>
    </>
  );
};
