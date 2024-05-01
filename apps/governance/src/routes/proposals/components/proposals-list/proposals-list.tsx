import orderBy from 'lodash/orderBy';
import { Trans, useTranslation } from 'react-i18next';
import { Heading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProtocolUpgradeProposalsListItem } from '../protocol-upgrade-proposals-list-item/protocol-upgrade-proposals-list-item';
import Routes from '../../../routes';
import { Button, Pagination } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ExternalLinks } from '@vegaprotocol/environment';
import { type ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { type BatchProposal, type Proposal } from '../../types';
import {
  BASE_FILTER,
  Filters,
  useProposalsFilters,
  useProposalsPagination,
} from '../proposals-list-filter/proposals-list-filter';
import { type ProposalChange, type ProposalState } from '@vegaprotocol/types';
import intersection from 'lodash/intersection';
import compact from 'lodash/compact';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';
import flatten from 'lodash/flatten';
import { UPGRADE_STATUS_PROPOSAL_STATE_MAP } from '../current-proposal-state/current-proposal-state';

type EnrichedProtocolUpgradeProposals =
  ProtocolUpgradeProposalFieldsFragment & { timestamp: string };

export type Proposals = Array<
  Proposal | BatchProposal | EnrichedProtocolUpgradeProposals
>;

/**
 * Gets from the sortable parameter value from a given proposal
 * (single, batch or upgrade).
 */
export const getSortableTerm = (
  p: Proposal | BatchProposal | EnrichedProtocolUpgradeProposals
) => {
  let date: string = '';
  if (p.__typename === 'Proposal') {
    date = p.terms.enactmentDatetime ? p.terms.enactmentDatetime : p.datetime;
  }
  if (p.__typename === 'ProtocolUpgradeProposal') {
    date = p.timestamp;
  }
  if (p.__typename === 'BatchProposal') {
    date = p.datetime;
    const mostRecentEnactmentDatetime = last(
      sortBy(
        compact(
          p.subProposals?.map(
            (sub) => sub?.terms?.enactmentDatetime as string | null
          )
        ),
        (x) => new Date(x).getTime()
      )
    );
    if (mostRecentEnactmentDatetime) date = mostRecentEnactmentDatetime;
  }

  return new Date(date).getTime();
};

interface ProposalsListProps {
  proposals: Proposals;
  lastBlockHeight?: string;
}

export const orderByDate = (arr: Array<Proposal | BatchProposal>) =>
  orderBy(
    arr,
    [
      (p) => {
        if (p.__typename === 'BatchProposal') {
          // Batch proposals can have different enactment dates, this could be improved by ordering
          // by soonest enactment date in the batch
          return new Date(p.batchTerms?.closingDatetime || p.datetime);
        }

        if (p.__typename === 'Proposal') {
          return p?.terms?.enactmentDatetime
            ? new Date(p?.terms?.enactmentDatetime).getTime()
            : // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered
              new Date(p?.terms?.closingDatetime || 0).getTime();
        }

        throw new Error('invalid proposal');
      },
      (p) => new Date(p?.datetime).getTime(),
    ],
    ['asc', 'asc']
  );

export const orderByUpgradeBlockHeight = (
  arr: ProtocolUpgradeProposalFieldsFragment[]
) =>
  orderBy(
    arr,
    [
      (p) => (p?.upgradeBlockHeight ? parseInt(p.upgradeBlockHeight, 10) : 0),
      (p) => p.vegaReleaseTag,
    ],
    ['desc', 'desc']
  );

const ITEMS_PER_PAGE = 20;
export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();

  const [proposalTypes, proposalStates, proposalId, resetFilters] =
    useProposalsFilters((state) => [
      state.types,
      state.states,
      state.id,
      state.reset,
    ]);

  const filter = {
    types: proposalTypes.length > 0 ? proposalTypes : BASE_FILTER.types,
    states: proposalStates.length > 0 ? proposalStates : BASE_FILTER.states,
    id: proposalId,
  };

  const [page, setPage] = useProposalsPagination((state) => [
    state.page,
    state.setPage,
  ]);

  useProposalsFilters.subscribe(() => {
    setPage(1);
  });

  let filtered = proposals;

  // filter by proposal type
  filtered = filtered.filter((proposal) => {
    let types: (ProposalChange['__typename'] | 'NetworkUpgrade')[] = [];
    if (proposal.__typename === 'Proposal') {
      types = [proposal.terms.change.__typename];
    }
    if (proposal.__typename === 'BatchProposal') {
      types = proposal.subProposals
        ? proposal.subProposals.map((sub) => sub?.terms?.change.__typename)
        : [];
    }
    if (proposal.__typename === 'ProtocolUpgradeProposal') {
      types = ['NetworkUpgrade'];
    }
    return intersection(filter.types, types).length > 0;
  });
  // filter by proposal state
  filtered = filtered.filter((proposal) => {
    let states: ProposalState[] = [];
    if (
      proposal.__typename === 'Proposal' ||
      proposal.__typename === 'BatchProposal'
    ) {
      states = [proposal.state];
    }
    if (proposal.__typename === 'ProtocolUpgradeProposal') {
      const upgradeState = proposal.status;
      states = [UPGRADE_STATUS_PROPOSAL_STATE_MAP[upgradeState]];
    }
    return intersection(filter.states, states).length > 0;
  });
  // filter by proposal id
  filtered = filtered.filter((proposal) => {
    if (filter.id.length > 0) {
      const term = filter.id.toLowerCase();
      let ids: string[] = [];
      if (proposal.__typename === 'Proposal') {
        ids = compact([
          proposal?.id?.toLowerCase(),
          proposal?.party?.id?.toString().toLowerCase(),
          proposal.terms.change.__typename === 'UpdateMarket' &&
            proposal.terms.change.marketId,
          proposal.terms.change.__typename === 'UpdateMarketState' &&
            proposal.terms.change.market.id,
          // TODO: Enable spot market filtering
          // proposal.terms.change.__typename === 'UpdateSpotMarket' && proposal.terms.change.marketId
        ]);
      } else if (proposal.__typename === 'BatchProposal') {
        const subs = compact(
          flatten(
            proposal.subProposals?.map((sub) => [
              sub?.id?.toLowerCase(),
              sub?.terms?.change.__typename === 'UpdateMarket' &&
                sub.terms.change.marketId,
              sub?.terms?.change.__typename === 'UpdateMarketState' &&
                sub.terms.change.market.id,
              // TODO: Enable spot market filtering
              // sub?.terms?.change.__typename === 'UpdateSpotMarket' && sub.terms.change.marketId
            ])
          )
        );
        ids = compact([
          proposal?.id?.toLowerCase(),
          proposal?.party?.id?.toString().toLowerCase(),
          ...subs,
        ]);
      }
      return ids.some((id) => id.includes(term));
    }
    return true;
  });

  const filteredAndSorted = orderBy(filtered, getSortableTerm, 'desc');

  const PROPOSALS_COUNT = filtered.length;
  const HAS_NEXT = page * ITEMS_PER_PAGE < PROPOSALS_COUNT;
  const HAS_PREV = page > 1;

  const SLICE_START = (page - 1) * ITEMS_PER_PAGE;
  const SLICE_END = page * ITEMS_PER_PAGE;

  return (
    <div data-testid="proposals-list">
      <div className="grid xs:grid-cols-2 items-center">
        <Heading
          centerContent={false}
          marginBottom={false}
          title={t('pageTitleProposals')}
        />

        <div className="xs:justify-self-end" data-testid="new-proposal-link">
          <Link to={`${Routes.PROPOSALS}/propose/raw`}>
            <Button variant="primary" size="sm">
              <div className="flex items-center gap-1">{t('NewProposal')}</div>
            </Button>
          </Link>
        </div>
      </div>

      <p className="mb-8">
        {t(
          `The Vega network is governed by the community. View active proposals, vote on them or propose changes to the network. Network upgrades are proposed and approved by validators.`
        )}{' '}
        <ExternalLink
          data-testid="proposal-documentation-link"
          href={ExternalLinks.GOVERNANCE_PAGE}
          className="text-white"
        >
          {t(`Find out more about Vega governance`)}
        </ExternalLink>
      </p>

      <Filters count={PROPOSALS_COUNT} />

      <Pagination
        hasPrevPage={HAS_PREV}
        hasNextPage={HAS_NEXT}
        onBack={() => {
          setPage(page - 1);
        }}
        onNext={() => {
          setPage(page + 1);
        }}
        onFirst={() => setPage(1)}
        onLast={() => setPage(Math.ceil(PROPOSALS_COUNT / ITEMS_PER_PAGE))}
      >
        {t('Page')} {page}
      </Pagination>

      <section className="relative">
        {PROPOSALS_COUNT > 0 ? (
          <ul className="list-none" data-testid="proposal-list-items">
            {filteredAndSorted
              .slice(SLICE_START, SLICE_END)
              .map((proposal, i) => {
                if (
                  proposal.__typename === 'Proposal' ||
                  proposal.__typename === 'BatchProposal'
                ) {
                  return <ProposalsListItem key={i} proposal={proposal} />;
                }
                if (proposal.__typename === 'ProtocolUpgradeProposal') {
                  return (
                    <ProtocolUpgradeProposalsListItem
                      key={i}
                      proposal={proposal}
                    />
                  );
                }
                return null;
              })}
          </ul>
        ) : (
          <div className="text-center text-sm py-3" data-testid="no-proposals">
            <Trans
              i18nKey="No proposals found that are matching the given criteria, try <0>resetting</0> the filters."
              components={[
                <button
                  key="filter-reset-btn"
                  className="underline"
                  onClick={() => resetFilters()}
                >
                  resetting
                </button>,
              ]}
            />
          </div>
        )}
      </section>
      <Pagination
        hasPrevPage={HAS_PREV}
        hasNextPage={HAS_NEXT}
        onBack={() => {
          setPage(page - 1);
        }}
        onNext={() => {
          setPage(page + 1);
        }}
        onFirst={() => setPage(1)}
        onLast={() => setPage(Math.ceil(PROPOSALS_COUNT / ITEMS_PER_PAGE))}
      >
        {t('Page')} {page}
      </Pagination>
    </div>
  );
};
