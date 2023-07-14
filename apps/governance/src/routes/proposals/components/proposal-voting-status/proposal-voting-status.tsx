import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { useVoteInformation } from '../../hooks';
import { BigNumber } from '../../../../lib/bignumber';
import type { NetworkParamsResult } from '@vegaprotocol/network-parameters';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

const statusClasses = (reached: boolean) =>
  classNames('flex items-center gap-2 px-4 py-2 rounded-md', {
    'bg-vega-green-700': reached,
    'bg-vega-red-700': !reached,
  });

const MajorityStatus = ({
  reached,
  requiredMajority,
}: {
  reached: boolean;
  requiredMajority: string | null | undefined;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={statusClasses(reached)}
      data-testid="proposal-majority-status"
    >
      {reached ? <Icon name="tick" /> : <Icon name="cross" />}
      {reached ? (
        <div data-testid="majority-reached">
          {requiredMajority ? (
            <>
              {new BigNumber(requiredMajority).times(100).toString()}%{' '}
              {t('majorityVotedForProposal')}
            </>
          ) : (
            t('requiredMajorityVotedForProposal')
          )}
        </div>
      ) : (
        <div data-testid="majority-not-reached">
          {requiredMajority ? (
            <>
              {new BigNumber(requiredMajority).times(100).toString()}%{' '}
              {t('majorityNotVotedForProposal')}
            </>
          ) : (
            t('requiredMajorityNotVotedForProposal')
          )}
        </div>
      )}
    </div>
  );
};

const ParticipationStatus = ({ reached }: { reached: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className={statusClasses(reached)}>
      {reached ? (
        <>
          <Icon name="tick" />
          <div data-testid="participation-reached">
            {t('minParticipationReached')}
          </div>
        </>
      ) : (
        <>
          <Icon name="cross" />
          <div data-testid="participation-not-reached">
            {t('minParticipationNotReached')}
          </div>
        </>
      )}
    </div>
  );
};

export const ProposalVotingStatus = ({
  proposal,
  networkParams,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  networkParams: Partial<NetworkParamsResult>;
}) => {
  const { t } = useTranslation();
  const { majorityMet, majorityLPMet, participationMet, participationLPMet } =
    useVoteInformation({
      proposal,
    });

  if (!proposal) {
    return null;
  }

  const isUpdateMarket = proposal?.terms.change.__typename === 'UpdateMarket';

  let requiredVotingMajority = null;
  let requiredVotingMajorityLP = null;

  if (networkParams) {
    switch (proposal.terms.change.__typename) {
      case 'NewMarket':
        requiredVotingMajority =
          networkParams.governance_proposal_market_requiredMajority;
        break;
      case 'UpdateMarket':
        requiredVotingMajority =
          networkParams.governance_proposal_updateMarket_requiredMajority;
        requiredVotingMajorityLP =
          networkParams.governance_proposal_updateMarket_requiredMajorityLP;
        break;
      case 'NewAsset':
        requiredVotingMajority =
          networkParams.governance_proposal_asset_requiredMajority;
        break;
      case 'UpdateAsset':
        requiredVotingMajority =
          networkParams.governance_proposal_updateAsset_requiredMajority;
        break;
      case 'UpdateNetworkParameter':
        requiredVotingMajority =
          networkParams.governance_proposal_updateNetParam_requiredMajority;
        break;
      case 'NewFreeform':
        requiredVotingMajority =
          networkParams.governance_proposal_freeform_requiredMajority;
        break;
    }
  }

  return (
    (isUpdateMarket && (
      <div className="mb-6">
        <p>{t('Token vote')}</p>
        <div
          className="grid grid-cols-2 gap-4 items-center"
          data-testid="token-vote-statuses"
        >
          <MajorityStatus
            reached={majorityMet}
            requiredMajority={requiredVotingMajority}
          />{' '}
          <ParticipationStatus reached={participationMet} />
        </div>

        <p className="mt-4">{t('Liquidity provider vote')}</p>
        <div
          className="grid grid-cols-2 gap-4 items-center"
          data-testid="lp-vote-statuses"
        >
          <MajorityStatus
            reached={majorityLPMet}
            requiredMajority={requiredVotingMajorityLP}
          />{' '}
          <ParticipationStatus reached={participationLPMet} />
        </div>
      </div>
    )) || (
      <div className="grid grid-cols-2 gap-4 items-center mb-6">
        <MajorityStatus
          reached={majorityMet}
          requiredMajority={requiredVotingMajority}
        />{' '}
        <ParticipationStatus reached={participationMet} />
      </div>
    )
  );
};
