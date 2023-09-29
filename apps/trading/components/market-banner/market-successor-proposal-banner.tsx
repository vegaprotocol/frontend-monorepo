import { Fragment, useState } from 'react';
import type {
  MarketViewProposalFieldsFragment,
  NewMarketSuccessorFieldsFragment,
} from '@vegaprotocol/proposals';
import { useMarketViewProposals } from '@vegaprotocol/proposals';
import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import * as Types from '@vegaprotocol/types';

export const MarketSuccessorProposalBanner = ({
  marketId,
}: {
  marketId?: string;
}) => {
  const proposals = useMarketViewProposals({
    skip: !marketId,
    inState: Types.ProposalState.STATE_OPEN,
    proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    typename: 'NewMarket',
  });

  const successors =
    proposals?.filter((item) => {
      if (item.terms.change.__typename === 'NewMarket') {
        const newMarket = item.terms.change;
        if (
          newMarket.successorConfiguration?.parentMarketId === marketId &&
          item.state === Types.ProposalState.STATE_OPEN
        ) {
          return true;
        }
      }
      return false;
    }) ?? [];
  const [visible, setVisible] = useState(true);
  const tokenLink = useLinks(DApp.Governance);
  if (visible && successors.length) {
    return (
      <NotificationBanner
        intent={Intent.Primary}
        onClose={() => {
          setVisible(false);
        }}
      >
        <div className="uppercase mb-1">
          {successors.length === 1
            ? t('A successors to this market has been proposed')
            : t('Successors to this market have been proposed')}
        </div>
        <div>
          {successors.length === 1
            ? t('Check out the terms of the proposal and vote:')
            : t('Check out the terms of the proposals and vote:')}{' '}
          {successors.map((item, i) => {
            const externalLink = tokenLink(
              TOKEN_PROPOSAL.replace(':id', item.id || '')
            );
            return (
              <Fragment key={i}>
                <ExternalLink href={externalLink} key={i}>
                  {
                    (item.terms?.change as NewMarketSuccessorFieldsFragment)
                      ?.instrument.name
                  }
                </ExternalLink>
                {i < successors.length - 1 && ', '}
              </Fragment>
            );
          })}
        </div>
      </NotificationBanner>
    );
  }
  return null;
};
