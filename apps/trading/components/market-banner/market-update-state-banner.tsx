import { type ReactNode } from 'react';
import sortBy from 'lodash/sortBy';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { MarketViewProposalFieldsFragment } from '@vegaprotocol/proposals';
import { ProposalState } from '@vegaprotocol/types';
import {
  DApp,
  TOKEN_PROPOSAL,
  TOKEN_PROPOSALS,
  useLinks,
} from '@vegaprotocol/environment';
import { Market, getQuoteName } from '@vegaprotocol/markets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

export const MarketUpdateStateBanner = ({
  market,
  proposals,
}: {
  market: Market;
  proposals: MarketViewProposalFieldsFragment[];
}) => {
  const t = useT();
  const governanceLink = useLinks(DApp.Governance);

  const openProposals = sortBy(
    proposals.filter((p) => p.state === ProposalState.STATE_OPEN),
    (p) => p.terms.enactmentDatetime
  );
  const passedProposals = sortBy(
    proposals.filter((p) => p.state === ProposalState.STATE_PASSED),
    (p) => p.terms.enactmentDatetime
  );

  if (!passedProposals.length && !openProposals.length) {
    return null;
  }

  const name = market.tradableInstrument.instrument.code;
  const assetSymbol = getQuoteName(market);

  const proposalLink =
    !passedProposals.length && openProposals[0]?.id
      ? governanceLink(TOKEN_PROPOSAL.replace(':id', openProposals[0]?.id))
      : undefined;

  const proposalsLink =
    openProposals.length > 1 ? governanceLink(TOKEN_PROPOSALS) : undefined;

  let content: ReactNode;

  if (passedProposals.length) {
    const { date, duration, price } = getMessageVariables(passedProposals[0]);
    content = (
      <>
        <div className="uppercase mb-1">
          {t('Trading on Market {{name}} will stop on {{date}}', {
            name,
            date,
          })}
        </div>
        <div>
          {t(
            'You will no longer be able to hold a position on this market when it closes in {{duration}}.',
            { duration }
          )}{' '}
          {price &&
            assetSymbol &&
            t('The final price will be {{price}} {{assetSymbol}}.', {
              price: addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            })}
        </div>
      </>
    );
  } else if (openProposals.length > 1) {
    content = (
      <>
        <div className="uppercase mb-1">
          {t(
            'Trading on Market {{name}} may stop. There are open proposals to close this market',
            { name }
          )}
        </div>
        <div>
          <ExternalLink href={proposalsLink}>
            {t('View proposals')}
          </ExternalLink>
        </div>
      </>
    );
  } else {
    const { date, price } = getMessageVariables(openProposals[0]);
    content = (
      <>
        <div className="uppercase mb-1">
          {t(
            'Trading on Market {{name}} may stop on {{date}}. There is open proposal to close this market.',
            { name, date }
          )}
        </div>
        <div>
          {price &&
            assetSymbol &&
            t('Proposed final price is {{price}} {{assetSymbol}}.', {
              price: addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            })}
        </div>
        <div>
          <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>
        </div>
      </>
    );
  }

  return (
    <div data-testid={`termination-warning-banner-${market.id}`}>{content}</div>
  );
};

const getMessageVariables = (proposal: MarketViewProposalFieldsFragment) => {
  const enactmentDatetime = new Date(proposal.terms.enactmentDatetime);
  const date = format(enactmentDatetime, 'dd MMMM');
  const duration = formatDuration(
    intervalToDuration({
      start: new Date(),
      end: enactmentDatetime,
    }),
    {
      format: ['days', 'hours'],
    }
  );
  const price =
    proposal.terms.change.__typename === 'UpdateMarketState'
      ? proposal.terms.change.price
      : '';
  return {
    date,
    duration,
    price,
  };
};
