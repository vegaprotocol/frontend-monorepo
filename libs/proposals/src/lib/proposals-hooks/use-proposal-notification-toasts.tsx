import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { ProposalStateMapping, MarketUpdateType } from '@vegaprotocol/types';
import { ProposalState } from '@vegaprotocol/types';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { ExternalLink, Intent } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import type { NotificationProposalsFieldsFragment } from '../proposals-data-provider';
import { useNotificationProposalsSubscription } from '../proposals-data-provider';

export const PROPOSAL_STATES_TO_TOAST = [
  ProposalState.STATE_DECLINED,
  ProposalState.STATE_ENACTED,
  ProposalState.STATE_OPEN,
  ProposalState.STATE_PASSED,
];

const PROPOSAL_TYPES_TO_TOAST = [
  'UpdateNetworkParameter',
  'NewAsset',
  'NewMarket',
  'UpdateAsset',
  'UpdateMarket',
  'UpdateMarketState',
];

type Proposal = NotificationProposalsFieldsFragment;

const NotificationProposalToastContent = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const { data: assets } = useAssetsDataProvider();
  const tokenLink = useLinks(DApp.Governance);
  const change = proposal.terms.change;
  let pretitle = 'New';
  let content: ReactNode = null;
  switch (change.__typename) {
    case 'UpdateNetworkParameter':
      pretitle = t('Network change');
      content = (
        <p className="italic">
          '{t('Update ')}
          <span className="break-all">{change.networkParameter.key}</span>
          {t(' to ')}
          <span>{change.networkParameter.value}</span>'
        </p>
      );
      break;
    case 'NewMarket':
      pretitle = t('New market');
      content = (
        <p>
          {t('New market ')}
          <span className="break-all">{change.instrument.name}</span>
          {change.successorConfiguration?.parentMarketId && (
            <span>
              {' '}
              {t('successor of %', [
                change.successorConfiguration.parentMarketId,
              ])}
            </span>
          )}
        </p>
      );
      break;
    case 'UpdateMarket':
      pretitle = t('Update market');
      content = (
        <p>
          {t('Market ')}
          <span className="break-all">
            {change.updateMarketConfiguration.instrument.code}
          </span>
        </p>
      );
      break;
    case 'UpdateMarketState':
      if (
        change.updateType ===
        MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE
      ) {
        pretitle = t('Market termination');
      } else if (
        change.updateType === MarketUpdateType.MARKET_STATE_UPDATE_TYPE_SUSPEND
      ) {
        pretitle = t('Market suspension');
      } else {
        pretitle = t('Market resume');
      }
      content = (
        <p>
          {t('Market ')}
          <span className="break-all">
            {change.market.tradableInstrument.instrument.name}
          </span>
          {change.price && (
            <span> {t('Final price will be %s', [change.price])}</span>
          )}
        </p>
      );
      break;
    case 'NewAsset':
      pretitle = t('New asset');
      content = (
        <p>
          <span className="break-all">
            {change.name} ({change.symbol})
          </span>
          {', '}
          {t('type %s', [
            change.source.__typename === 'ERC20' ? 'ERC20' : 'Builtin asset',
          ])}
        </p>
      );
      break;
    case 'UpdateAsset':
      pretitle = t('Update asset');
      content = (
        <p>
          <span className="break-all">
            {assets?.find((asset) => asset.id === change.assetId)?.name ??
              change.assetId}
          </span>
        </p>
      );
      break;
    default:
  }
  const title = t('%s proposal %s', [
    pretitle,
    ProposalStateMapping[proposal.state].toLowerCase(),
  ]);
  const enactment = Date.parse(proposal.terms.enactmentDatetime);
  return (
    <div>
      <ToastHeading>{title}</ToastHeading>
      {content}
      {!isNaN(enactment) && (
        <p>
          {t('Enactment date:')} {getDateTimeFormat().format(enactment)}
        </p>
      )}
      <p>
        <ExternalLink
          href={tokenLink(TOKEN_PROPOSAL).replace(':id', proposal?.id || '')}
        >
          {t('View proposal details')}
        </ExternalLink>
      </p>
    </div>
  );
};

export const useProposalNotificationToasts = () => {
  const setToast = useToasts((store) => store.setToast);
  const remove = useToasts((store) => store.remove);
  const hasToast = useToasts((store) => store.hasToast);
  const fromProposal = useCallback(
    (proposal: Proposal): Toast => {
      const id = `proposal-notification-${proposal.id}`;
      return {
        id,
        intent: Intent.Warning,
        content: <NotificationProposalToastContent proposal={proposal} />,
        onClose: () => {
          remove(id);
        },
      };
    },
    [remove]
  );

  const displayToast = (toast: Toast) => {
    if (!hasToast(toast.id)) {
      setToast(toast);
    }
  };

  return useNotificationProposalsSubscription({
    onData: ({ data }) => {
      // note proposals is poorly named, it is actually a single proposal
      const proposal = data.data?.proposals;
      if (!proposal) return;
      if (!PROPOSAL_TYPES_TO_TOAST.includes(proposal.terms.change.__typename)) {
        return;
      }
      // if one of the following states show a toast
      if (PROPOSAL_STATES_TO_TOAST.includes(proposal.state)) {
        displayToast(fromProposal(proposal));
      }
    },
  });
};
