import { useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { proposalsDataProvider } from '@vegaprotocol/proposals';
import take from 'lodash/take';
import * as Types from '@vegaprotocol/types';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  TOKEN_PROPOSAL,
  TOKEN_PROPOSALS,
  useLinks,
} from '@vegaprotocol/environment';
import { useT } from '../../lib/use-t';

export const ProposedMarkets = () => {
  const t = useT();
  const variables = useMemo(() => {
    return {
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    };
  }, []);
  const { data } = useDataProvider({
    dataProvider: proposalsDataProvider,
    variables,
    skipUpdates: true,
  });

  const newMarkets = take(
    (data || []).filter((proposal) =>
      [
        Types.ProposalState.STATE_OPEN,
        Types.ProposalState.STATE_PASSED,
        Types.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
      ].includes(proposal.state)
    ),
    3
  ).map((proposal) => ({
    id: proposal.id,
    displayName:
      proposal.terms.change.__typename === 'NewMarket' &&
      proposal.terms.change.instrument.code,
  }));

  const tokenLink = useLinks(DApp.Governance);
  return useMemo(
    () => (
      <div className="mt-7 pt-8 border-t border-default">
        {newMarkets.length > 0 ? (
          <>
            <h2 className="font-alpha uppercase text-2xl">
              {t('Proposed markets')}
            </h2>
            <dl data-testid="welcome-notice-proposed-markets" className="py-5">
              {newMarkets.map(({ displayName, id }, i) => (
                <div className="pt-1 flex justify-between" key={i}>
                  <dl>{displayName}</dl>
                  <dt>
                    <ExternalLink
                      href={tokenLink(TOKEN_PROPOSAL.replace(':id', id || ''))}
                    >
                      {t('View or vote')}
                    </ExternalLink>
                  </dt>
                </div>
              ))}
            </dl>
            <ExternalLink href={tokenLink(TOKEN_PROPOSALS)}>
              {t('View all proposed markets')}
            </ExternalLink>
          </>
        ) : (
          <ExternalLink href={tokenLink(TOKEN_NEW_MARKET_PROPOSAL)}>
            {t('Propose a market')}
          </ExternalLink>
        )}
      </div>
    ),
    [newMarkets, tokenLink, t]
  );
};
