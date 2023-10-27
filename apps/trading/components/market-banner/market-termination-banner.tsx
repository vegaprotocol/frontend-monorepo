import type { ReactNode } from 'react';
import { useState } from 'react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import type { MarketViewProposalFieldsFragment } from '@vegaprotocol/proposals';
import { marketViewProposalsDataProvider } from '@vegaprotocol/proposals';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/markets';
import { getQuoteName } from '@vegaprotocol/markets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import sortBy from 'lodash/sortBy';
import {
  DApp,
  TOKEN_PROPOSAL,
  TOKEN_PROPOSALS,
  useLinks,
} from '@vegaprotocol/environment';
import { useDataProvider } from '@vegaprotocol/data-provider';

const filterProposals = (
  data: MarketViewProposalFieldsFragment[] | null,
  marketId: string,
  now: number
) =>
  sortBy(
    (data || []).filter(
      (item) =>
        item.terms.change.__typename === 'UpdateMarketState' &&
        item.terms.change.market.id === marketId &&
        item.terms.change.updateType ===
          Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE &&
        item.terms.enactmentDatetime &&
        new Date(item.terms.enactmentDatetime).getTime() > now
    ),
    (item) => item.terms.enactmentDatetime
  );

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

export const MarketTerminationBanner = ({
  market,
}: {
  market: Market | null;
}) => {
  const [visible, setVisible] = useState(true);
  const skip = !market || !visible;
  const { data: passedProposalsData } = useDataProvider({
    dataProvider: marketViewProposalsDataProvider,
    skip,
    variables: {
      inState: Types.ProposalState.STATE_PASSED,
      proposalType: Types.ProposalType.TYPE_UPDATE_MARKET_STATE,
    },
  });

  const { data: openProposalsData } = useDataProvider({
    dataProvider: marketViewProposalsDataProvider,
    skip,
    variables: {
      inState: Types.ProposalState.STATE_OPEN,
      proposalType: Types.ProposalType.TYPE_UPDATE_MARKET_STATE,
    },
  });

  const governanceLink = useLinks(DApp.Governance);

  if (!market) return null;
  const now = Date.now();
  const passedProposals = filterProposals(passedProposalsData, market.id, now);
  const openProposals = filterProposals(openProposalsData, market.id, now);

  const name = market.tradableInstrument.instrument.code;
  if (!passedProposals.length && !openProposals.length) {
    return null;
  }

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
          {t('Trading on Market %s will stop on %s', [name, date])}
        </div>
        <div>
          {t(
            'You will no longer be able to hold a position on this market when it closes in %s.',
            [duration]
          )}{' '}
          {price &&
            assetSymbol &&
            t('The final price will be %s %s.', [
              addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            ])}
        </div>
      </>
    );
  } else if (openProposals.length > 1) {
    content = (
      <>
        <div className="uppercase mb-1">
          {t(
            'Trading on Market %s may stop. There are open proposals to close this market',
            [name]
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
            'Trading on Market %s may stop on %s. There is open proposal to close this market.',
            [name, date]
          )}
        </div>
        <div>
          {price &&
            assetSymbol &&
            t('Proposed final price is %s %s.', [
              addDecimalsFormatNumber(price, market.decimalPlaces),
              assetSymbol,
            ])}
        </div>
        <div>
          <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>
        </div>
      </>
    );
  }
  return (
    <NotificationBanner
      intent={openProposals.length ? Intent.Warning : Intent.Info}
      onClose={() => {
        setVisible(false);
      }}
      data-testid={`termination-warning-banner-${market.id}`}
    >
      {content}
    </NotificationBanner>
  );
};
