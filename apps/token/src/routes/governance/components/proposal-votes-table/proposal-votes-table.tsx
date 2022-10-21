import { useTranslation } from 'react-i18next';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import {
  formatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/react-helpers';
import { useVoteInformation } from '../../hooks';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';
import { ProposalType } from '../proposal/proposal';

interface ProposalVotesTableProps {
  proposal: Proposal_proposal;
  proposalType: ProposalType | null;
}

export const ProposalVotesTable = ({
  proposal,
  proposalType,
}: ProposalVotesTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { totalSupply },
  } = useAppState();
  const {
    willPass,
    willPassLP,
    totalTokensPercentage,
    totalLPTokensPercentage,
    participationMet,
    participationLPMet,
    totalTokensVoted,
    totalLPTokensVoted,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
    noTokens,
    noLPTokens,
    yesTokens,
    yesLPTokens,
    yesVotes,
    noVotes,
    totalVotes,
    requiredMajorityPercentage,
    requiredMajorityLPPercentage,
    requiredParticipation,
    requiredParticipationLP,
    majorityMet,
    majorityLPMet,
  } = useVoteInformation({ proposal });

  const isUpdateMarket = proposalType === ProposalType.PROPOSAL_UPDATE_MARKET;
  const updateMarketWillPass = willPass || willPassLP;
  const updateMarketVotePassMethod =
    updateMarketWillPass &&
    (willPass ? t('byTokenVote') : t('byLiquidityVote'));

  return (
    <KeyValueTable
      title={t('voteBreakdown')}
      data-testid="proposal-votes-table"
      numerical={true}
      headingLevel={4}
    >
      <KeyValueTableRow>
        {t('willPass')}
        {isUpdateMarket
          ? updateMarketWillPass
            ? `👍 ${updateMarketVotePassMethod}`
            : '👎'
          : willPass
          ? '👍'
          : '👎'}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('majorityMet')}
        {majorityMet ? '👍' : '👎'}
      </KeyValueTableRow>
      {isUpdateMarket && (
        <KeyValueTableRow>
          {t('majorityLPMet')}
          {majorityLPMet ? '👍' : '👎'}
        </KeyValueTableRow>
      )}
      <KeyValueTableRow>
        {t('participationMet')}
        {participationMet ? '👍' : '👎'}
      </KeyValueTableRow>
      {isUpdateMarket && (
        <KeyValueTableRow>
          {t('participationLPMet')}
          {participationLPMet ? '👍' : '👎'}
        </KeyValueTableRow>
      )}
      <KeyValueTableRow>
        {t('tokenForProposal')}
        {formatNumber(yesTokens, 2)}
      </KeyValueTableRow>
      {isUpdateMarket && (
        <KeyValueTableRow>
          {t('tokenLPForProposal')}
          {formatNumber(yesLPTokens, 2)}
        </KeyValueTableRow>
      )}
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
      {isUpdateMarket && (
        <>
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
        </>
      )}
    </KeyValueTable>
  );
};
