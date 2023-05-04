import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Button,
  Icon,
  Intent,
  Lozenge,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { stripFullStops } from '@vegaprotocol/utils';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import { SubHeading } from '../../../../components/heading';
import type { ReactNode } from 'react';
import Routes from '../../../routes';
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
        <div data-testid="protocol-upgrade-proposal-status-icon-rejected">
          <Icon name={'cross'} />
        </div>
      );
      break;
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING:
      proposalStatusIcon = (
        <div data-testid="protocol-upgrade-proposal-status-icon-pending">
          <Icon name={'time'} />
        </div>
      );
      break;
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED:
      proposalStatusIcon = (
        <div data-testid="protocol-upgrade-proposal-status-icon-approved">
          <Icon name={'tick'} />
        </div>
      );
      break;
    case ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED:
      proposalStatusIcon = (
        <div data-testid="protocol-upgrade-proposal-status-icon-unspecified">
          <Icon name={'disable'} />
        </div>
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
          <div
            data-testid="protocol-upgrade-proposal-type"
            className="flex items-center gap-2 mb-4"
          >
            <Lozenge variant={Intent.Success}>{t('networkUpgrade')}</Lozenge>
          </div>

          <div
            data-testid="protocol-upgrade-proposal-release-tag"
            className="mb-2"
          >
            <span className="pr-2">{t('vegaReleaseTag')}</span>
            <Lozenge>{proposal.vegaReleaseTag}</Lozenge>
          </div>

          <div
            data-testid="protocol-upgrade-proposal-block-height"
            className="mb-2"
          >
            <span className="pr-2">{t('upgradeBlockHeight')}</span>
            <Lozenge>{proposal.upgradeBlockHeight}</Lozenge>
          </div>

          <div className="grid grid-cols-[1fr_auto] mt-3 items-start gap-2">
            <div className="col-start-1 row-start-1 text-white">
              <div
                data-testid="protocol-upgrade-proposal-status"
                className="flex items-center gap-2"
              >
                <span>{t(`${proposal.status}`)}</span>
                <span>{proposalStatusIcon}</span>
              </div>
            </div>

            <div className="col-start-2 row-start-2 justify-self-end">
              <Link
                to={`${Routes.PROPOSALS}/protocol-upgrade/${stripFullStops(
                  proposal.vegaReleaseTag
                )}`}
              >
                <Button data-testid="view-proposal-btn" size="sm">
                  {t('View')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RoundedWrapper>
    </li>
  );
};
