import { type ReactNode } from 'react';
import sortBy from 'lodash/sortBy';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { type ProposalFragment } from '@vegaprotocol/proposals';
import { MarketUpdateType, ProposalState } from '@vegaprotocol/types';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { getQuoteName } from '@vegaprotocol/markets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { type Market } from '@vegaprotocol/data-provider';

export const MarketUpdateStateBanner = ({
  market,
  proposals,
}: {
  market: Market;
  proposals: ProposalFragment[];
}) => {
  const t = useT();
  const governanceLink = useLinks(DApp.Governance);

  const openTradingProposals = sortBy(
    proposals.filter(
      (p) =>
        p.terms &&
        p.terms.change.__typename === 'UpdateMarketState' &&
        p.terms.change.updateType ===
          MarketUpdateType.MARKET_STATE_UPDATE_TYPE_RESUME
    ),
    (p) => p.terms?.enactmentDatetime
  );

  const openProposals = sortBy(
    proposals.filter((p) => p.state === ProposalState.STATE_OPEN),
    (p) => p.terms?.enactmentDatetime
  );
  const passedProposals = sortBy(
    proposals.filter((p) => p.state === ProposalState.STATE_PASSED),
    (p) => p.terms?.enactmentDatetime
  );

  if (!passedProposals.length && !openProposals.length) {
    return null;
  }

  const name = market.tradableInstrument.instrument.code;

  const openTradingProposalsLink =
    openTradingProposals[0]?.__typename === 'Proposal' &&
    openTradingProposals[0]?.id
      ? governanceLink(
          TOKEN_PROPOSAL.replace(':id', openTradingProposals[0].id)
        )
      : openTradingProposals[0]?.__typename === 'ProposalDetail' &&
        openTradingProposals[0]?.batchId
      ? governanceLink(
          TOKEN_PROPOSAL.replace(':id', openTradingProposals[0].batchId)
        )
      : undefined;

  let content: ReactNode;

  if (openTradingProposals.length >= 1) {
    content = (
      <div className="flex flex-col gap-1">
        <p>
          {t(
            'Trading on market {{name}} was suspended by governance. There are open proposals to resume trading on this market.',
            { name }
          )}
        </p>
        <p>
          <ExternalLink href={openTradingProposalsLink}>
            {t('View proposals')}
          </ExternalLink>
        </p>
      </div>
    );
  } else if (passedProposals.length) {
    content = (
      <PassedProposalContent market={market} proposal={passedProposals[0]} />
    );
  } else {
    content = (
      <OpenProposalContent market={market} proposal={openProposals[0]} />
    );
  }

  return <div data-testid={`update-state-banner-${market.id}`}>{content}</div>;
};

const OpenProposalContent = ({
  market,
  proposal,
}: {
  market: Market;
  proposal: ProposalFragment;
}) => {
  const t = useT();
  const governanceLink = useLinks(DApp.Governance);
  const { date, action, price } = useMessageVariables(proposal);

  const assetSymbol = getQuoteName(market);
  const proposalLink = proposal.id
    ? governanceLink(TOKEN_PROPOSAL.replace(':id', proposal.id))
    : undefined;

  const change =
    proposal.terms?.change.__typename === 'UpdateMarketState'
      ? proposal.terms.change
      : undefined;

  return (
    <div className="flex flex-col gap-1">
      <p>
        {t(
          'Trading on market {{name}} may {{action}} on {{date}}. There is an open proposal to {{action}} this market.',
          { name: market.tradableInstrument.instrument.code, action, date }
        )}
      </p>
      {change?.updateType ===
        MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE && (
        <p>
          {price &&
            assetSymbol &&
            t('Proposed final price is {{price}} {{assetSymbol}}.', {
              price: addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            })}{' '}
          <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>
        </p>
      )}
    </div>
  );
};

const PassedProposalContent = ({
  market,
  proposal,
}: {
  market: Market;
  proposal: ProposalFragment;
}) => {
  const t = useT();
  const { date, action, price, duration } = useMessageVariables(proposal);

  const assetSymbol = getQuoteName(market);

  const change =
    proposal.terms?.change.__typename === 'UpdateMarketState'
      ? proposal.terms.change
      : undefined;

  return (
    <div className="flex flex-col gap-1">
      <p className="uppercase">
        {t('Trading on market {{name}} will {{action}} on {{date}}', {
          name: market.tradableInstrument.instrument.code,
          date,
          action,
        })}
      </p>
      {change?.updateType ===
        MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE && (
        <p>
          {t(
            'You will no longer be able to hold a position on this market when it terminates in {{duration}}.',
            { duration }
          )}{' '}
          {price &&
            assetSymbol &&
            t('The final price will be {{price}} {{assetSymbol}}.', {
              price: addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            })}
        </p>
      )}
    </div>
  );
};

const useMessageVariables = (proposal: ProposalFragment) => {
  const t = useT();
  const enactmentDatetime =
    proposal.terms && new Date(proposal.terms.enactmentDatetime);
  const date = enactmentDatetime && format(enactmentDatetime, 'dd MMMM');
  const duration =
    enactmentDatetime &&
    formatDuration(
      intervalToDuration({
        start: new Date(),
        end: enactmentDatetime,
      }),
      {
        format: ['days', 'hours'],
      }
    );
  const price =
    proposal.terms?.change.__typename === 'UpdateMarketState'
      ? proposal.terms.change.price
      : '';

  const action =
    proposal.terms?.change.__typename === 'UpdateMarketState'
      ? t(proposal.terms.change.updateType)
      : 'change';

  return {
    date,
    duration,
    price,
    action,
  };
};
