import { Dialog, Link } from '@vegaprotocol/ui-toolkit';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { proposalsListDataProvider } from '@vegaprotocol/governance';
import { Schema as Types } from '@vegaprotocol/types';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { useCallback, useMemo } from 'react';
import { useGlobalStore } from '../../stores';
import take from 'lodash/take';
import type { ProposalListFieldsFragment } from '@vegaprotocol/governance';

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

  console.log(data);
  const newMarkets = take(
    (data || []).filter((proposal) =>
      [
        Types.ProposalState.STATE_ENACTED,
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

  const { VEGA_TOKEN_URL, VEGA_NETWORKS } = useEnvironment();

  const consoleFairgroundLink = `${VEGA_NETWORKS[Networks.TESTNET]}`;
  const governanceLink = useCallback(
    (proposal?: string | null) =>
      `${VEGA_TOKEN_URL}/governance/${proposal || ''}`,
    [VEGA_TOKEN_URL]
  );

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
                  <Link target="_blank" href={governanceLink(id)}>
                    {t('View or vote')}
                  </Link>
                </dt>
              </div>
            ))}
          </dl>
          <Link href={governanceLink()}>{t('View all proposed markets')}</Link>
        </div>
      ),
    [governanceLink, newMarkets]
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
          <Link target="_blank" href={consoleFairgroundLink}>
            {t('Try out Console')}
          </Link>
          {t(' on Fairground, our Testnet')}
        </li>
        <li>
          <Link target="_blank" href={governanceLink()}>
            {t('View and vote for proposed markets')}
          </Link>
        </li>
        <li>
          <Link target="_blank" href={governanceLink('propose')}>
            {t('Propose your own markets')}
          </Link>
        </li>
        <li>
          <Link target="_blank" href={governanceLink()}>
            {t('Read about the mainnet launch')}
          </Link>
        </li>
      </ul>
      {proposedMarkets}
    </Dialog>
  );
};
