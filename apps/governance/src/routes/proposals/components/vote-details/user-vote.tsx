import { useTranslation } from 'react-i18next';
import { Icon, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { ProposalState } from '@vegaprotocol/types';
import { ConnectToVega } from '../../../../components/connect-to-vega';
import { VoteButtonsContainer } from './vote-buttons';
import { SubHeading } from '../../../../components/heading';
import { type VoteValue } from '@vegaprotocol/types';
import { type VegaTxState } from '@vegaprotocol/proposals';
import { type VoteState } from './use-user-vote';
import { type Proposal, type BatchProposal } from '../../types';

interface UserVoteProps {
  proposal: Proposal;
  minVoterBalance: string | null | undefined;
  spamProtectionMinTokens: string | null | undefined;
  transaction: VegaTxState;
  submit: (voteValue: VoteValue, proposalId: string | null) => Promise<void>;
  voteState: VoteState | null;
  voteDatetime: Date | null;
}

export const UserVote = ({
  proposal,
  submit,
  transaction,
  voteState,
  voteDatetime,
}: UserVoteProps) => {
  const { pubKey } = useVegaWallet();

  const { t } = useTranslation();

  return (
    <section data-testid="user-vote">
      {proposal?.state === ProposalState.STATE_OPEN ? (
        <SubHeading title={t('castYourVote')} />
      ) : (
        <SubHeading title={t('yourVote')} />
      )}

      {pubKey ? (
        proposal && (
          <VoteButtonsContainer
            changeType={
              proposal.__typename === 'BatchProposal'
                ? // @ts-ignore should not be null/undefined
                  proposal.subProposals[0]?.terms?.change.__typename
                : // @ts-ignore should not be null/undefined
                  proposal.terms?.change.__typename
            }
            voteState={voteState}
            voteDatetime={voteDatetime}
            proposalState={proposal.state}
            proposalId={proposal.id ?? ''}
            className="flex"
            submit={submit}
            transaction={transaction}
          />
        )
      ) : (
        <div className="pb-2">
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
        </div>
      )}
    </section>
  );
};
