import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { RoundedWrapper, Icon, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalState } from '@vegaprotocol/types';
import { useVoteSubmit, VoteProgress } from '@vegaprotocol/proposals';
import { formatNumber } from '../../../../lib/format-number';
import { ConnectToVega } from '../../../../components/connect-to-vega';
import { useVoteInformation } from '../../hooks';
import { useUserVote } from './use-user-vote';
import { CurrentProposalStatus } from '../current-proposal-status';
import { VoteButtonsContainer } from './vote-buttons';
import { SubHeading } from '../../../../components/heading';
import { ProposalType } from '../proposal/proposal';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface VoteDetailsProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  minVoterBalance: string | null | undefined;
  spamProtectionMinTokens: string | null | undefined;
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
    totalLPTokensPercentage,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
    yesTokens,
    noTokens,
    requiredMajorityPercentage,
    requiredMajorityLPPercentage,
    requiredParticipation,
    requiredParticipationLP,
    participationLPMet,
  } = useVoteInformation({ proposal });

  const { t } = useTranslation();
  const { submit, Dialog, finalizedVote } = useVoteSubmit();
  const { voteState, voteDatetime } = useUserVote(proposal?.id, finalizedVote);
  const defaultDecimals = 2;
  const daysLeft = t('daysLeft', {
    daysLeft: formatDistanceToNow(new Date(proposal?.terms.closingDatetime)),
  });

  return (
    <>
      {proposalType === ProposalType.PROPOSAL_UPDATE_MARKET && (
        <section>
          <SubHeading title={t('liquidityVotes')} />
          <p data-testid="liquidity-votes-status">
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

          <p className="mb-6">
            {t('participation')}
            {': '}
            {participationLPMet ? (
              <span className="text-vega-green mx-4">{t('met')}</span>
            ) : (
              <span className="text-danger mx-4">{t('notMet')}</span>
            )}{' '}
            {formatNumber(totalLPTokensPercentage, defaultDecimals)}%
            <span className="ml-4">
              {requiredParticipationLP && (
                <>
                  ({formatNumber(requiredParticipationLP, defaultDecimals)}%{' '}
                  {t('governanceRequired')})
                </>
              )}
            </span>
          </p>
        </section>
      )}
      <section data-testid="votes-table">
        <SubHeading title={t('tokenVotes')} />
        <p data-testid="token-votes-status">
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

        <section className="mt-10">
          {proposal?.state === ProposalState.STATE_OPEN ? (
            <SubHeading title={t('castYourVote')} />
          ) : (
            <SubHeading title={t('yourVote')} />
          )}

          {pubKey ? (
            proposal && (
              <VoteButtonsContainer
                voteState={voteState}
                voteDatetime={voteDatetime}
                proposalState={proposal.state}
                proposalId={proposal.id ?? ''}
                minVoterBalance={minVoterBalance}
                spamProtectionMinTokens={spamProtectionMinTokens}
                className="flex"
                submit={submit}
                dialog={Dialog}
              />
            )
          ) : (
            <RoundedWrapper paddingBottom={true}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={'info-sign'} />
                  <div>{t('connectAVegaWalletToVote')}</div>
                </div>
                <ExternalLink href="https://blog.vega.xyz/how-to-vote-on-vega-2195d1e52ec5">
                  {t('findOutMoreAboutHowToVote')}
                </ExternalLink>
              </div>
              <ConnectToVega />
            </RoundedWrapper>
          )}
        </section>
      </section>
    </>
  );
};
