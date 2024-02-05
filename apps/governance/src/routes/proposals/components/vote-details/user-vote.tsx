import { useTranslation } from 'react-i18next';
import { Icon, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalState } from '@vegaprotocol/types';
import { ConnectToVega } from '../../../../components/connect-to-vega';
import { VoteButtonsContainer } from './vote-buttons';
import { SubHeading } from '../../../../components/heading';
import { type VoteValue } from '@vegaprotocol/types';
import { type DialogProps, type VegaTxState } from '@vegaprotocol/proposals';
import { type VoteState } from './use-user-vote';
import { type Proposal } from '../../types';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';

interface UserVoteProps {
  proposal: Proposal;
  transaction: VegaTxState | null;
  submit: (voteValue: VoteValue, proposalId: string | null) => Promise<void>;
  dialog: (props: DialogProps) => JSX.Element;
  voteState: VoteState | null;
  voteDatetime: Date | null;
}

export const UserVote = ({
  proposal,
  submit,
  transaction,
  dialog,
  voteState,
  voteDatetime,
}: UserVoteProps) => {
  const { pubKey } = useVegaWallet();

  const { t } = useTranslation();

  const { params: networkParams } = useNetworkParams([
    NetworkParams.governance_proposal_market_minVoterBalance,
    NetworkParams.governance_proposal_updateMarket_minVoterBalance,
    NetworkParams.governance_proposal_asset_minVoterBalance,
    NetworkParams.governance_proposal_updateAsset_minVoterBalance,
    NetworkParams.governance_proposal_updateNetParam_minVoterBalance,
    NetworkParams.governance_proposal_freeform_minVoterBalance,
    NetworkParams.governance_proposal_referralProgram_minVoterBalance,
    NetworkParams.governance_proposal_VolumeDiscountProgram_minVoterBalance,
    NetworkParams.spam_protection_voting_min_tokens,
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_updateAsset_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredMajority,
    NetworkParams.governance_proposal_referralProgram_requiredMajority,
    NetworkParams.governance_proposal_VolumeDiscountProgram_requiredMajority,
  ]);

  let minVoterBalance = null;

  if (networkParams) {
    switch (proposal.terms.change.__typename) {
      case 'UpdateMarket':
      case 'UpdateMarketState':
        minVoterBalance =
          networkParams.governance_proposal_updateMarket_minVoterBalance;
        break;
      case 'NewMarket':
        minVoterBalance =
          networkParams.governance_proposal_market_minVoterBalance;
        break;
      case 'NewAsset':
        minVoterBalance =
          networkParams.governance_proposal_asset_minVoterBalance;
        break;
      case 'UpdateAsset':
        minVoterBalance =
          networkParams.governance_proposal_updateAsset_minVoterBalance;
        break;
      case 'UpdateNetworkParameter':
        minVoterBalance =
          networkParams.governance_proposal_updateNetParam_minVoterBalance;
        break;
      case 'NewFreeform':
        minVoterBalance =
          networkParams.governance_proposal_freeform_minVoterBalance;
        break;
      case 'NewTransfer':
        // TODO: check minVoterBalance for 'NewTransfer'
        minVoterBalance =
          networkParams.governance_proposal_freeform_minVoterBalance;
        break;
      case 'CancelTransfer':
        // TODO: check minVoterBalance for 'CancelTransfer'
        minVoterBalance =
          networkParams.governance_proposal_freeform_minVoterBalance;
        break;
      case 'UpdateReferralProgram':
        minVoterBalance =
          networkParams.governance_proposal_referralProgram_minVoterBalance;
        break;
      case 'UpdateVolumeDiscountProgram':
        minVoterBalance =
          networkParams.governance_proposal_VolumeDiscountProgram_minVoterBalance;
        break;
    }
  }

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
            spamProtectionMinTokens={
              networkParams.spam_protection_voting_min_tokens
            }
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
