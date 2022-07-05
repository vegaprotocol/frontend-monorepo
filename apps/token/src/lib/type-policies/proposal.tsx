import type { Proposals_proposals } from '../../routes/governance/proposals/__generated__/Proposals';
import { useTranslation } from 'react-i18next';

export const ProposalHeader = ({
  proposal,
}: {
  proposal: Proposals_proposals;
}) => {
  const { t } = useTranslation();
  const { change } = proposal.terms;

  let primaryText: string;
  let secondaryText: string;

  switch (change.__typename) {
    case 'NewMarket':
      primaryText = `${t('New market')}: ${change.instrument.name}`;
      break;
    case 'NewAsset':
      primaryText = `${t('Asset change')}: ${change.symbol}`;
      break;
    case 'UpdateMarket':
      primaryText = `${t('Market change')}: ${change.marketId}`;
      break;
    case 'UpdateNetworkParameter':
      primaryText = `${t('Network parameter change')}: ${
        change.networkParameter.key
      }`;
      break;
    case 'NewFreeform':
      primaryText = `${proposal.rationale.hash}`;
      break;
    default:
      primaryText = `${t('Unknown proposal')}`;
  }

  return <header data-testid="proposal-primary-text">{primaryText}</header>;
};
