import { useTranslation } from 'react-i18next';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '../../../../lib/format-number';
import { useVoteInformation } from '../../hooks';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

interface ProposalVotesTableProps {
  proposal: Proposals_proposals;
}

export const ProposalVotesTable = ({ proposal }: ProposalVotesTableProps) => {
  const { t } = useTranslation();
  const {
    willPass,
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    noTokens,
    yesTokens,
    yesVotes,
    noVotes,
    totalVotes,
    requiredMajorityPercentage,
    requiredParticipation,
    majorityMet,
  } = useVoteInformation({ proposal });

  return (
    <KeyValueTable
      title={t('voteBreakdown')}
      data-testid="proposal-votes-table"
      muted={true}
      numerical={true}
    >
      <KeyValueTableRow>
        {t('willPass')}
        <span>{willPass ? '👍' : '👎'}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('majorityMet')}
        <span>{majorityMet ? '👍' : '👎'}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('participationMet')}
        <span>{participationMet ? '👍' : '👎'}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('tokenForProposal')}
        <span>{formatNumber(yesTokens, 2)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('tokensAgainstProposal')}
        <span>{formatNumber(noTokens, 2)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('participationRequired')}
        <span>{formatNumber(requiredParticipation)}%</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('majorityRequired')}
        <span>{formatNumber(requiredMajorityPercentage)}%</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('numberOfVotingParties')}
        <span>{formatNumber(totalVotes, 0)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('totalTokensVotes')}
        <span>{formatNumber(totalTokensVoted, 2)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('totalTokenVotedPercentage')}
        <span>{formatNumber(totalTokensPercentage, 2)}%</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('numberOfForVotes')}
        <span>{formatNumber(yesVotes, 0)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('numberOfAgainstVotes')}
        <span>{formatNumber(noVotes, 0)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('yesPercentage')}
        <span>{formatNumber(yesPercentage, 2)}%</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('noPercentage')}
        <span>{formatNumber(noPercentage, 2)}%</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
