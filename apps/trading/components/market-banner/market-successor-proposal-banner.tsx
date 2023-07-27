import { useState } from 'react';
import type {
  SuccessorProposalListFieldsFragment,
  NewMarketSuccessorFieldsFragment,
} from '@vegaprotocol/proposals';
import { useSuccessorProposalsListQuery } from '@vegaprotocol/proposals';
import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';

export const MarketSuccessorProposalBanner = ({
  marketId,
}: {
  marketId?: string;
}) => {
  const { data: proposals } = useSuccessorProposalsListQuery({
    skip: !marketId,
  });
  const successors =
    proposals?.proposalsConnection?.edges
      ?.map((item) => item?.node as SuccessorProposalListFieldsFragment)
      .filter(
        (item: SuccessorProposalListFieldsFragment) =>
          (item.terms?.change as NewMarketSuccessorFieldsFragment)
            ?.successorConfiguration?.parentMarketId === marketId
      ) ?? [];
  const [visible, setVisible] = useState(true);
  const tokenLink = useLinks(DApp.Token);
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
              <>
                <ExternalLink href={externalLink} key={i}>
                  {
                    (item.terms?.change as NewMarketSuccessorFieldsFragment)
                      ?.instrument.name
                  }
                </ExternalLink>
                {i < successors.length - 1 && ', '}
              </>
            );
          })}
        </div>
      </NotificationBanner>
    );
  }
  return null;
};
