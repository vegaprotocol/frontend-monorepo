import { useTranslation } from 'react-i18next';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import type { ProposalFieldsFragment } from '@vegaprotocol/governance';
import {
  formatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/react-helpers';
import { useVoteInformation } from '../../hooks';
import { useAppState } from '../../../../contexts/app-state/app-state-context';

interface ProposalVotesTableProps {
  proposal: ProposalFieldsFragment;
}

export const ProposalVotesTable = ({ proposal }: ProposalVotesTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { totalSupply },
  } = useAppState();
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
      numerical={true}
      headingLevel={4}
    >
      <KeyValueTableRow>
        {t('willPass')}
        {willPass ? '👍' : '👎'}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('majorityMet')}
        {majorityMet ? '👍' : '👎'}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('participationMet')}
        {participationMet ? '👍' : '👎'}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('tokenForProposal')}
        {formatNumber(yesTokens, 2)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('totalSupply')}
        {formatNumber(totalSupply, 2)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('tokensAgainstProposal')}
        {formatNumber(noTokens, 2)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('participationRequired')}
        {formatNumberPercentage(requiredParticipation)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('majorityRequired')}
        {formatNumberPercentage(requiredMajorityPercentage)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('numberOfVotingParties')}
        {formatNumber(totalVotes, 0)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('totalTokensVotes')}
        {formatNumber(totalTokensVoted, 2)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('totalTokenVotedPercentage')}
        {formatNumberPercentage(totalTokensPercentage, 2)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('numberOfForVotes')}
        {formatNumber(yesVotes, 0)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('numberOfAgainstVotes')}
        {formatNumber(noVotes, 0)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('yesPercentage')}
        {formatNumberPercentage(yesPercentage, 2)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('noPercentage')}
        {formatNumberPercentage(noPercentage, 2)}
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
