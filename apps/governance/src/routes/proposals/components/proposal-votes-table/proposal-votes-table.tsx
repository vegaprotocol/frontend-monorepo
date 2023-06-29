import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  Thumbs,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { formatNumber, formatNumberPercentage } from '@vegaprotocol/utils';
import { SubHeading } from '../../../../components/heading';
import { useVoteInformation } from '../../hooks';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { ProposalType } from '../proposal/proposal';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface ProposalVotesTableProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
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
  const [showDetails, setShowDetails] = useState(false);
  const {
    willPassByTokenVote,
    willPassByLPVote,
    totalTokensPercentage,
    participationMet,
    participationLPMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    noTokens,
    yesTokens,
    yesEquityLikeShareWeight,
    yesVotes,
    noVotes,
    totalVotes,
    requiredMajorityPercentage,
    requiredParticipation,
    majorityMet,
    majorityLPMet,
  } = useVoteInformation({ proposal });

  const isUpdateMarket = proposalType === ProposalType.PROPOSAL_UPDATE_MARKET;
  const updateMarketWillPass = willPassByTokenVote || willPassByLPVote;
  const updateMarketVotePassMethod = willPassByTokenVote
    ? t('byTokenVote')
    : t('byLiquidityVote');

  return (
    <>
      <CollapsibleToggle
        toggleState={showDetails}
        setToggleState={setShowDetails}
        dataTestId="vote-breakdown-toggle"
      >
        <SubHeading title={t('voteBreakdown')} />
      </CollapsibleToggle>

      {showDetails && (
        <RoundedWrapper marginBottomLarge={true} paddingBottom={true}>
          <KeyValueTable
            data-testid="proposal-votes-table"
            numerical={true}
            headingLevel={4}
          >
            <KeyValueTableRow>
              {t('expectedToPass')}
              {isUpdateMarket ? (
                updateMarketWillPass ? (
                  <Thumbs up={true} text={updateMarketVotePassMethod} />
                ) : (
                  <Thumbs up={false} />
                )
              ) : willPassByTokenVote ? (
                <Thumbs up={true} />
              ) : (
                <Thumbs up={false} />
              )}
            </KeyValueTableRow>
            <KeyValueTableRow>
              {t('majorityMet')}
              {majorityMet ? <Thumbs up={true} /> : <Thumbs up={false} />}
            </KeyValueTableRow>
            {isUpdateMarket && (
              <KeyValueTableRow>
                {t('majorityLPMet')}
                {majorityLPMet ? <Thumbs up={true} /> : <Thumbs up={false} />}
              </KeyValueTableRow>
            )}
            <KeyValueTableRow>
              {t('participationMet')}
              {participationMet ? <Thumbs up={true} /> : <Thumbs up={false} />}
            </KeyValueTableRow>
            {isUpdateMarket && (
              <KeyValueTableRow>
                {t('participationLPMet')}
                {participationLPMet ? (
                  <Thumbs up={true} />
                ) : (
                  <Thumbs up={false} />
                )}
              </KeyValueTableRow>
            )}
            <KeyValueTableRow>
              {t('tokenForProposal')}
              {formatNumber(yesTokens, 2)}
            </KeyValueTableRow>
            {isUpdateMarket && (
              <KeyValueTableRow>
                {t('tokenLPForProposal')}
                {formatNumber(yesEquityLikeShareWeight, 2)}
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
                <KeyValueTableRow noBorder={true}>
                  {t('noPercentage')}
                  {formatNumberPercentage(noPercentage, 2)}
                </KeyValueTableRow>
              </>
            )}
          </KeyValueTable>
        </RoundedWrapper>
      )}
    </>
  );
};
