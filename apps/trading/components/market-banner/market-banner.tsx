import compact from 'lodash/compact';
import { type Proposal, ProposalState, MarketState } from '@vegaprotocol/types';
import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import {
  useSuccessorMarket,
  useMarketState,
  useMarket,
  type Market,
} from '@vegaprotocol/markets';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { useMarketProposals } from '@vegaprotocol/proposals';
import { MarketSuspendedBanner } from './market-suspended-banner';

type UpdateMarketBanner = {
  kind: 'UpdateMarket';
  data: Proposal;
};

type UpdateMarketStateBanner = {
  kind: 'UpdateMarketState';
  data: Proposal;
};

type NewMarketBanner = {
  kind: 'NewMarket';
  data: Proposal;
};

type SettledBanner = {
  kind: 'Settled';
  data: Market;
};

type SuspendedBanner = {
  kind: 'Suspended';
  data: Market;
};

type Banner =
  | UpdateMarketBanner
  | UpdateMarketStateBanner
  | NewMarketBanner
  | SettledBanner
  | SuspendedBanner;

const useProposalsForMarket = (marketId: string, inState?: ProposalState) => {
  const { data, loading, error } = useMarketProposals({
    inState,
  });

  const proposals = compact(data || []);

  const proposalsForMarket = proposals.filter((p) => {
    const change = p.terms.change;

    if (
      change.__typename === 'UpdateMarketState' &&
      change.market.id === marketId
    ) {
      return true;
    }

    if (change.__typename === 'UpdateMarket' && change.marketId === marketId) {
      return true;
    }

    if (
      change.__typename === 'NewMarket' &&
      change.successorConfiguration?.parentMarketId === marketId
    ) {
      return true;
    }

    return false;
  });

  return { data, loading, error, proposals: proposalsForMarket };
};

export const MarketBanner = ({ marketId }: { marketId: string }) => {
  const { data: market } = useMarket(marketId);
  const { data: marketState } = useMarketState(marketId);

  const { proposals: openProposals, loading: openLoading } =
    useProposalsForMarket(marketId, ProposalState.STATE_OPEN);

  // eslint-disable-next-line
  const { data: successorData, loading: successorLoading } =
    useSuccessorMarket(marketId);

  if (!market) {
    return null;
  }

  if (openLoading || successorLoading) {
    return null;
  }

  // @ts-ignore ts can't infer that the typename will only evert match kind here
  const banners: Banner[] = openProposals.map((p) => ({
    kind: p.terms.change.__typename,
    data: p,
  }));

  if (marketState === MarketState.STATE_SETTLED) {
    banners.unshift({
      kind: 'Settled',
      data: market,
    });
  } else if (marketState === MarketState.STATE_SUSPENDED_VIA_GOVERNANCE) {
    banners.unshift({
      kind: 'Suspended',
      data: market,
    });
  }

  return <NotificationQueue notifications={banners as Banner[]} />;
};

const NotificationQueue = ({ notifications }: { notifications: Banner[] }) => {
  const [index, setIndex] = useState(0);

  const n = notifications[index];

  if (n) {
    let content = null;
    let intent = Intent.Primary;

    switch (n.kind) {
      case 'UpdateMarket': {
        content = (
          <p data-testid="market-proposal-notification">
            <Trans
              i18nKey="Changes have been proposed for this market. <0>View proposals</0>"
              components={[
                // TODO: Fix link
                <ExternalLink key="view-link" href={'https://google.com'}>
                  View proposals
                </ExternalLink>,
              ]}
            />
          </p>
        );
        break;
      }
      case 'UpdateMarketState': {
        content = <p>UpdateMarketState</p>;
        break;
      }
      case 'NewMarket': {
        intent = Intent.Primary;
        content = <p>NewMarket</p>;
        break;
      }
      case 'Settled': {
        content = <p>Successor</p>;
        break;
      }
      case 'Suspended': {
        intent = Intent.Warning;
        content = <MarketSuspendedBanner />;
        break;
      }
      default: {
        throw new Error('invalid banner kind');
      }
    }
    const showCount = notifications.length > 1;

    const onClose = showCount
      ? () => {
          setIndex((x) => x + 1);
        }
      : undefined;

    return (
      <NotificationBanner intent={intent} onClose={onClose}>
        <div className="flex justify-between">
          {content}
          {showCount ? (
            <p>
              {index + 1}/{notifications.length}
            </p>
          ) : null}
        </div>
      </NotificationBanner>
    );
  }

  return null;
};
