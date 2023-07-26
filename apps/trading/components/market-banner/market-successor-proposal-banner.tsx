import { useState } from 'react';
import type { SuccessorProposalListFieldsFragment } from '@vegaprotocol/proposals';
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
      ?.map((item: { node: SuccessorProposalListFieldsFragment }) => item.node)
      .filter(
        (item: SuccessorProposalListFieldsFragment) =>
          item.terms?.change?.successorConfiguration?.parentMarketId ===
          marketId
      ) ?? [];
  const [invisibles, setInvisible] = useState<boolean[]>([]);
  const tokenLink = useLinks(DApp.Token);
  if (successors.length) {
    return successors.map((item, i) => {
      const externalLink = tokenLink(TOKEN_PROPOSAL.replace(':id', item.id));
      return invisibles[i] ? null : (
        <NotificationBanner
          key={i}
          intent={Intent.Primary}
          onClose={() => {
            setInvisible((prevState) => {
              prevState[i] = true;
              return [...prevState];
            });
          }}
        >
          <div className="uppercase mb-1">
            {t('This market has proposal of succession as a new market')}
          </div>
          <div>
            {t('Check out terms of the proposal and vote')}{' '}
            <ExternalLink href={externalLink}>
              {item.terms?.change?.instrument.name}
            </ExternalLink>
          </div>
        </NotificationBanner>
      );
    });
  }
  return null;
};
