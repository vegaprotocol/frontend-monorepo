import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { stripFullStops } from '@vegaprotocol/utils';
import { SubHeading } from '../../../../components/heading';
import { ProposalInfoLabel } from '../proposal-info-label';
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

  return (
    <li
      id={proposal.upgradeBlockHeight}
      data-testid="protocol-upgrade-proposals-list-item"
    >
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <div
          data-testid="protocol-upgrade-proposal-type"
          className="flex items-center gap-2 mb-4 text-sm"
        >
          <ProposalInfoLabel variant="highlight">
            {t('networkUpgrade')}
          </ProposalInfoLabel>
        </div>

        <div
          data-testid="protocol-upgrade-proposal-title"
          className="text-sm mb-2"
        >
          <SubHeading title={`Vega release ${proposal.vegaReleaseTag}`} />
        </div>

        <div className="flex items-center gap-4 text-vega-light-200">
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
            <span>{proposal.upgradeBlockHeight}</span>
          </div>
        </div>

        <div
          className="text-sm text-vega-light-300 mb-4"
          data-testid="protocol-upgrade-proposal-status"
        >
          {t(`${proposal.status}`)}
        </div>

        <Link
          to={`${Routes.PROTOCOL_UPGRADES}/${stripFullStops(
            proposal.vegaReleaseTag
          )}`}
        >
          <Button data-testid="view-proposal-btn">{t('viewDetails')}</Button>
        </Link>
      </RoundedWrapper>
    </li>
  );
};
