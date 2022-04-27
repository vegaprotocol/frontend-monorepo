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
    >
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('willPass')}</th>
        <td>{willPass ? '👍' : '👎'}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('majorityMet')}</th>
        <td>{majorityMet ? '👍' : '👎'}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('participationMet')}</th>
        <td>{participationMet ? '👍' : '👎'}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('tokenForProposal')}</th>
        <td>{formatNumber(yesTokens, 2)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('tokensAgainstProposal')}</th>
        <td>{formatNumber(noTokens, 2)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('participationRequired')}</th>
        <td>{formatNumber(requiredParticipation)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('majorityRequired')}</th>
        <td>{formatNumber(requiredMajorityPercentage)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('numberOfVotingParties')}</th>
        <td>{formatNumber(totalVotes, 0)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('totalTokensVotes')}</th>
        <td>{formatNumber(totalTokensVoted, 2)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('totalTokenVotedPercentage')}</th>
        <td>{formatNumber(totalTokensPercentage, 2)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('numberOfForVotes')}</th>
        <td>{formatNumber(yesVotes, 0)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('numberOfAgainstVotes')}</th>
        <td>{formatNumber(noVotes, 0)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('yesPercentage')}</th>
        <td>{formatNumber(yesPercentage, 2)}%</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true} numerical={true}>
        <th>{t('noPercentage')}</th>
        <td>{formatNumber(noPercentage, 2)}%</td>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
