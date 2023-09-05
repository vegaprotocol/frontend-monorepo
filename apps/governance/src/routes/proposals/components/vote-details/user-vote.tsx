import { useTranslation } from 'react-i18next';
import { Icon, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalState } from '@vegaprotocol/types';
import { ConnectToVega } from '../../../../components/connect-to-vega';
import { VoteButtonsContainer } from './vote-buttons';
import { SubHeading } from '../../../../components/heading';
import type { VoteValue } from '@vegaprotocol/types';
import type { DialogProps, VegaTxState } from '@vegaprotocol/wallet';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { VoteState } from './use-user-vote';

interface UserVoteProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  minVoterBalance: string | null | undefined;
  spamProtectionMinTokens: string | null | undefined;
  transaction: VegaTxState | null;
  submit: (voteValue: VoteValue, proposalId: string | null) => Promise<void>;
  dialog: (props: DialogProps) => JSX.Element;
  voteState: VoteState | null;
  voteDatetime: Date | null;
}

export const UserVote = ({
  proposal,
  minVoterBalance,
  spamProtectionMinTokens,
  submit,
  transaction,
  dialog,
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
            voteState={voteState}
            voteDatetime={voteDatetime}
            proposalState={proposal.state}
            proposalId={proposal.id ?? ''}
            minVoterBalance={minVoterBalance}
            spamProtectionMinTokens={spamProtectionMinTokens}
            className="flex"
            submit={submit}
            transaction={transaction}
            dialog={dialog}
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
