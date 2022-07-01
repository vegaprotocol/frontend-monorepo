import type { Proposals_proposals } from '../../routes/governance/proposals/__generated__/Proposals';
import { useTranslation } from 'react-i18next';

export const ProposalHeader = ({
  proposal,
}: {
  proposal: Proposals_proposals;
}) => {
  const { t } = useTranslation();
  const { change } = proposal.terms;

  let headerText: string;

  switch (change.__typename) {
    case 'NewMarket':
      headerText = `${t('New market')}: ${change.instrument.name}`;
      break;
    case 'NewAsset':
      headerText = `${t('Asset change')}: ${change.symbol}`;
      break;
    case 'UpdateMarket':
      headerText = `${t('Market change')}: ${change.marketId}`;
      break;
    case 'UpdateNetworkParameter':
      headerText = `${t('Network parameter change')}: ${
        change.networkParameter.key
      }`;
      break;
    case 'NewFreeform':
      headerText = `${proposal.rationale.hash}`;
      break;
    default:
      headerText = `${t('Unknown proposal')}`;
  }

  return <header>{headerText}</header>;
};
