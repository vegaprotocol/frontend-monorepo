import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import {
  formatDateWithLocalTimezone,
  stripFullStops,
} from '@vegaprotocol/utils';
import { SubHeading } from '../../../../components/heading';
import { ProposalInfoLabel } from '../proposal-info-label';
import Routes from '../../../routes';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { CurrentProposalState } from '../current-proposal-state';

interface ProtocolProposalsListItemProps {
  proposal: ProtocolUpgradeProposalFieldsFragment;
}

export const ProtocolUpgradeProposalsListItem = ({
  proposal,
}: ProtocolProposalsListItemProps) => {
  const { t } = useTranslation();
  if (!proposal || !proposal.upgradeBlockHeight) return null;

  const timestamp =
    'timestamp' in proposal ? (
      <span className="text-gs-300">
        ({formatDateWithLocalTimezone(new Date(proposal.timestamp as string))})
      </span>
    ) : null;

  return (
    <li
      id={proposal.upgradeBlockHeight}
      data-testid="protocol-upgrade-proposals-list-item"
    >
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <div
          data-testid="protocol-upgrade-proposal-type"
          className="flex items-center gap-2 mb-4 text-sm justify-between"
        >
          <ProposalInfoLabel variant="highlight">
            {t('networkUpgrade')}
          </ProposalInfoLabel>

          <div data-testid="proposal-status">
            <CurrentProposalState proposalState={proposal.status} />
          </div>
        </div>

        <div
          data-testid="protocol-upgrade-proposal-title"
          className="text-sm mb-2"
        >
          <SubHeading title={`Vega release ${proposal.vegaReleaseTag}`} />
        </div>

        <div className="flex items-center gap-4 text-gs-200">
          <div
            data-testid="protocol-upgrade-proposal-release-tag"
            className="mb-2"
          >
            <span>{t('vegaReleaseTag')}:</span>{' '}
            <span>{proposal.vegaReleaseTag}</span>
          </div>

          <div
            data-testid="protocol-upgrade-proposal-block-height"
            className="mb-2"
          >
            <span>{t('upgradeBlockHeight')}:</span>{' '}
            <span>{proposal.upgradeBlockHeight}</span> {timestamp}
          </div>
        </div>

        <div
          className="text-sm text-gs-300 mb-4"
          data-testid="protocol-upgrade-proposal-status"
        >
          {t(`${proposal.status}`)}
        </div>

        <Link
          to={`${Routes.PROTOCOL_UPGRADES}/${stripFullStops(
            proposal.vegaReleaseTag
          )}/${proposal.upgradeBlockHeight}`}
        >
          <Button data-testid="view-proposal-btn">{t('viewDetails')}</Button>
        </Link>
      </RoundedWrapper>
    </li>
  );
};
