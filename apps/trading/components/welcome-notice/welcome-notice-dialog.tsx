import { Dialog, ExternalLink, Link } from '@vegaprotocol/ui-toolkit';
import { proposalsListDataProvider } from '@vegaprotocol/governance';
import { Schema as Types } from '@vegaprotocol/types';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { useCallback, useEffect, useMemo } from 'react';
import { useGlobalStore } from '../../stores';
import take from 'lodash/take';
import { useLinks } from '../../lib/use-links';
import { GOVERNANCE_LINK, NEW_PROPOSAL_LINK } from '../constants';
import { activeMarketsProvider } from '@vegaprotocol/market-list';

export const WelcomeNoticeDialog = () => {
  const [welcomeNoticeDialog, update] = useGlobalStore((store) => [
    store.welcomeNoticeDialog,
    store.update,
  ]);

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      update({ welcomeNoticeDialog: isOpen });
    },
    [update]
  );

  const variables = useMemo(() => {
    return {
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    };
  }, []);

  const { data } = useDataProvider({
    dataProvider: proposalsListDataProvider,
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

  const tokenLink = useLinks('token');
  const consoleFairgroundLink = useLinks('console-fairground');

  const proposedMarkets = useMemo(
    () =>
      newMarkets.length > 0 && (
        <div className="mt-7 pt-8 border-t border-neutral-700">
          <h2 className="font-alpha uppercase text-2xl">
            {t('Proposed markets')}
          </h2>
          <dl className="py-5">
            {newMarkets.map(({ displayName, id }, i) => (
              <div className="pt-1 flex justify-between" key={i}>
                <dl>{displayName}</dl>
                <dt>
                  <ExternalLink href={tokenLink(`${GOVERNANCE_LINK}/${id}`)}>
                    {t('View or vote')}
                  </ExternalLink>
                </dt>
              </div>
            ))}
          </dl>
          <ExternalLink href={tokenLink(GOVERNANCE_LINK)}>
            {t('View all proposed markets')}
          </ExternalLink>
        </div>
      ),
    [newMarkets, tokenLink]
  );

  return (
    <Dialog open={welcomeNoticeDialog} onChange={onOpenChange}>
      <h1 className="font-alpha uppercase text-4xl mb-7 mt-5">
        {t('Welcome to Console')}
      </h1>
      <p className="leading-6 mb-7">
        {t(
          'Vega mainnet is now live, but markets need to be voted for before the can be traded on. In the meantime:'
        )}
      </p>
      <ul className="list-[square] pl-7">
        <li>
          <ExternalLink target="_blank" href={consoleFairgroundLink()}>
            {t('Try out Console')}
          </ExternalLink>
          {t(' on Fairground, our Testnet')}
        </li>
        <li>
          <ExternalLink target="_blank" href={tokenLink(GOVERNANCE_LINK)}>
            {t('View and vote for proposed markets')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink target="_blank" href={tokenLink(NEW_PROPOSAL_LINK)}>
            {t('Propose your own markets')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink target="_blank" href={tokenLink()}>
            {t('Read about the mainnet launch')}
          </ExternalLink>
        </li>
      </ul>
      {proposedMarkets}
    </Dialog>
  );
};

export const useWelcomeNoticeDialog = () => {
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  const { data } = useDataProvider({
    dataProvider: activeMarketsProvider,
  });
  useEffect(() => {
    if (data?.length === 0) {
      update({ welcomeNoticeDialog: true });
    }
  }, [data, update]);
};
