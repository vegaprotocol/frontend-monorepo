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
    willPassByTokenVote,
    willPassLP,
    totalTokensPercentage,
    participationMet,
    participationLPMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    noTokens,
    yesTokens,
    yesLPTokens,
    yesVotes,
    noVotes,
    totalVotes,
    requiredMajorityPercentage,
    requiredParticipation,
    majorityMet,
    majorityLPMet,
  } = useVoteInformation({ proposal });

  const isUpdateMarket = proposalType === ProposalType.PROPOSAL_UPDATE_MARKET;
  const updateMarketWillPass = willPassByTokenVote || willPassLP;
  const updateMarketVotePassMethod =
    updateMarketWillPass &&
    (willPassByTokenVote ? t('byTokenVote') : t('byLiquidityVote'));

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
          : willPassByTokenVote
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
      {!isUpdateMarket && (
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
