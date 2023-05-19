import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Button,
  Icon,
  Lozenge,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { stripFullStops } from '@vegaprotocol/utils';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import { SubHeading } from '../../../../components/heading';
import { ProposalInfoLabel } from '../proposal-info-label';
import Routes from '../../../routes';
import type { ReactNode } from 'react';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';

interface ProtocolProposalsListItemProps {
  proposal: ProtocolUpgradeProposalFieldsFragment;
}

export const ProtocolUpgradeProposalsListItem = ({
  proposal,
}: ProtocolProposalsListItemProps) => {
  const { t } = useTranslation();
  if (!proposal || !proposal.upgradeBlockHeight) return null;

  let proposalStatusIcon: ReactNode;

  switch (proposal.status) {
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED:
      proposalStatusIcon = (
        <span data-testid="protocol-upgrade-proposal-status-icon-rejected">
          <Icon name={'cross'} />
        </span>
      );
      break;
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING:
      proposalStatusIcon = (
        <span data-testid="protocol-upgrade-proposal-status-icon-pending">
          <Icon name={'time'} />
        </span>
      );
      break;
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED:
      proposalStatusIcon = (
        <span data-testid="protocol-upgrade-proposal-status-icon-approved">
          <Icon name={'tick'} />
        </span>
      );
      break;
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED:
      proposalStatusIcon = (
        <span data-testid="protocol-upgrade-proposal-status-icon-unspecified">
          <Icon name={'disable'} />
        </span>
      );
      break;
  }

  return (
    <li
      id={proposal.upgradeBlockHeight}
      data-testid="protocol-upgrade-proposals-list-item"
    >
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <div
          data-testid="protocol-upgrade-proposal-title"
          className="text-sm mb-2"
        >
          <SubHeading title={`Vega release ${proposal.vegaReleaseTag}`} />
        </div>

        <div className="text-sm">
          <div className="flex gap-2">
            <div
              data-testid="protocol-upgrade-proposal-type"
              className="flex items-center gap-2 mb-4"
            >
              <ProposalInfoLabel variant="highlight">
                {t('networkUpgrade')}
              </ProposalInfoLabel>
            </div>

            <div data-testid="protocol-upgrade-proposal-status">
              <ProposalInfoLabel>
                {t(`${proposal.status}`)} {proposalStatusIcon}
              </ProposalInfoLabel>
            </div>
          </div>

          <div
            data-testid="protocol-upgrade-proposal-release-tag"
            className="mb-2"
          >
            <span>{t('vegaReleaseTag')}:</span>{' '}
            <Lozenge>{proposal.vegaReleaseTag}</Lozenge>
          </div>

          <div
            data-testid="protocol-upgrade-proposal-block-height"
            className="mb-2"
          >
            <span>{t('upgradeBlockHeight')}:</span>{' '}
            <Lozenge>{proposal.upgradeBlockHeight}</Lozenge>
          </div>

          <div className="grid grid-cols-1 mt-3">
            <div className="justify-self-end">
              <Link
                to={`${Routes.PROTOCOL_UPGRADES}/${stripFullStops(
                  proposal.vegaReleaseTag
                )}`}
              >
                <Button data-testid="view-proposal-btn">{t('View')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </RoundedWrapper>
    </li>
  );
};
