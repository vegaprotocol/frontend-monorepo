import orderBy from 'lodash/orderBy';
import { isFuture } from 'date-fns';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, SubHeading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProtocolUpgradeProposalsListItem } from '../protocol-upgrade-proposals-list-item/protocol-upgrade-proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import Routes from '../../../routes';
import { Button, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { DocsLinks, ExternalLinks } from '@vegaprotocol/environment';

interface ProposalsListProps {
  proposals: Array<ProposalFieldsFragment | ProposalQuery['proposal']>;
  protocolUpgradeProposals: ProtocolUpgradeProposalFieldsFragment[];
  lastBlockHeight?: string;
}

interface SortedProposalsProps {
  open: Array<ProposalFieldsFragment | ProposalQuery['proposal']>;
  closed: Array<ProposalFieldsFragment | ProposalQuery['proposal']>;
}

interface SortedProtocolUpgradeProposalsProps {
  open: ProtocolUpgradeProposalFieldsFragment[];
  closed: ProtocolUpgradeProposalFieldsFragment[];
}

export const orderByDate = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.closingDatetime).getTime(),
      (p) => new Date(p?.datetime).getTime(),
    ],
    ['asc', 'asc']
  );

export const orderByUpgradeBlockHeight = (
  arr: ProtocolUpgradeProposalFieldsFragment[]
) =>
  orderBy(
    arr,
    [(p) => p?.upgradeBlockHeight, (p) => p.vegaReleaseTag],
    ['desc', 'desc']
  );

export const ProposalsList = ({
  proposals,
  protocolUpgradeProposals,
  lastBlockHeight,
}: ProposalsListProps) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');

  const sortedProposals: SortedProposalsProps = useMemo(() => {
    const initialSorting = proposals.reduce(
      (acc: SortedProposalsProps, proposal) => {
        if (isFuture(new Date(proposal?.terms.closingDatetime))) {
          acc.open.push(proposal);
        } else {
          acc.closed.push(proposal);
        }
        return acc;
      },
      {
        open: [],
        closed: [],
      }
    );
    return {
      open:
        initialSorting.open.length > 0
          ? orderByDate(initialSorting.open as ProposalFieldsFragment[])
          : [],
      closed:
        initialSorting.closed.length > 0
          ? orderByDate(
              initialSorting.closed as ProposalFieldsFragment[]
            ).reverse()
          : [],
    };
  }, [proposals]);

  const sortedProtocolUpgradeProposals: SortedProtocolUpgradeProposalsProps =
    useMemo(() => {
      const initialSorting = protocolUpgradeProposals.reduce(
        (acc: SortedProtocolUpgradeProposalsProps, proposal) => {
          if (Number(proposal?.upgradeBlockHeight) > Number(lastBlockHeight)) {
            acc.open.push(proposal);
          } else {
            acc.closed.push(proposal);
          }
          return acc;
        },
        {
          open: [],
          closed: [],
        }
      );
      return {
        open: orderByUpgradeBlockHeight(initialSorting.open),
        closed: orderByUpgradeBlockHeight(initialSorting.closed).reverse(),
      };
    }, [protocolUpgradeProposals, lastBlockHeight]);

  const filterPredicate = (
    p: ProposalFieldsFragment | ProposalQuery['proposal']
  ) =>
    p?.id?.includes(filterString) ||
    p?.party?.id?.toString().includes(filterString);

  return (
    <>
      <div className="grid xs:grid-cols-2 items-center">
        <Heading
          centerContent={false}
          marginBottom={false}
          title={t('pageTitleProposals')}
        />
        {DocsLinks && (
          <div className="xs:justify-self-end" data-testid="new-proposal-link">
            <ExternalLink href={DocsLinks.PROPOSALS_GUIDE}>
              <Button variant="primary" size="sm">
                <div className="flex items-center gap-1">
                  {t('NewProposal')}
                  <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
                </div>
              </Button>
            </ExternalLink>
          </div>
        )}
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
      {proposals.length > 0 && (
        <ProposalsListFilter setFilterString={setFilterString} />
      )}
      <section className="-mx-4 p-4 mb-8 bg-vega-dark-100">
        <SubHeading title={t('openProposals')} />
        {sortedProposals.open.length > 0 ||
        sortedProtocolUpgradeProposals.open.length > 0 ? (
          <ul data-testid="open-proposals">
            {sortedProtocolUpgradeProposals.open.map((proposal) => (
              <ProtocolUpgradeProposalsListItem
                key={proposal.upgradeBlockHeight}
                proposal={proposal}
              />
            ))}
            {sortedProposals.open.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal?.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mb-0" data-testid="no-open-proposals">
            {t('noOpenProposals')}
          </p>
        )}
      </section>
      <section>
        <SubHeading title={t('closedProposals')} />
        {sortedProposals.closed.length > 0 ||
        sortedProtocolUpgradeProposals.closed.length > 0 ? (
          <ul data-testid="closed-proposals">
            {sortedProtocolUpgradeProposals.closed.map((proposal) => (
              <ProtocolUpgradeProposalsListItem
                key={proposal.upgradeBlockHeight}
                proposal={proposal}
              />
            ))}

            {sortedProposals.closed.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal?.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mb-0" data-testid="no-closed-proposals">
            {t('noClosedProposals')}
          </p>
        )}
      </section>

      <Link className="underline" to={Routes.PROPOSALS_REJECTED}>
        {t('seeRejectedProposals')}
      </Link>
    </>
  );
};
