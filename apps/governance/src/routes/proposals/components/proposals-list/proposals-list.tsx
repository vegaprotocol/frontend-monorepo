import orderBy from 'lodash/orderBy';
import { isFuture } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, SubHeading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProtocolUpgradeProposalsListItem } from '../protocol-upgrade-proposals-list-item/protocol-upgrade-proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import Routes from '../../../routes';
import {
  Button,
  Toggle,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
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
      (p) =>
        p?.terms?.enactmentDatetime
          ? new Date(p?.terms?.enactmentDatetime).getTime()
          : // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered
            new Date(p?.terms?.closingDatetime || 0).getTime(),
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

enum ClosedProposalsViewOptions {
  NetworkGovernance = 'networkGovernance',
  NetworkUpgrades = 'networkUpgrades',
}

export const ProposalsList = ({
  proposals,
  protocolUpgradeProposals,
  lastBlockHeight,
}: ProposalsListProps) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');
  const [closedProposalsView, setClosedProposalsView] =
    useState<ClosedProposalsViewOptions>(
      ClosedProposalsViewOptions.NetworkGovernance
    );

  useEffect(() => {
    if (filterString.length > 0) {
      // If the filter is engaged, ensure the user is viewing governance proposals,
      // as network upgrades do not have IDs to filter by and will be excluded.
      setClosedProposalsView(ClosedProposalsViewOptions.NetworkGovernance);
    }
  }, [filterString]);

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
        closed: orderByUpgradeBlockHeight(initialSorting.closed),
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
        <ProposalsListFilter
          filterString={filterString}
          setFilterString={setFilterString}
        />
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

      <section className="relative">
        <SubHeading title={t('closedProposals')} />
        {sortedProposals.closed.length > 0 ||
        sortedProtocolUpgradeProposals.closed.length > 0 ? (
          <>
            {
              // We need both the closed proposals and closed protocol upgrade
              // proposals to be present for there to be a toggle. It also gets
              // hidden if the user has filtered the list, as the upgrade proposals
              // do not have the necessary fields for filtering.
              sortedProposals.closed.length > 0 &&
                sortedProtocolUpgradeProposals.closed.length > 0 &&
                filterString.length < 1 && (
                  <div
                    className="grid w-full justify-end xl:-mt-12 pb-6"
                    data-testid="toggle-closed-proposals"
                  >
                    <div className="w-[440px]">
                      <Toggle
                        name="closed-proposals-toggle"
                        toggles={[
                          {
                            label: t(
                              ClosedProposalsViewOptions.NetworkGovernance
                            ),
                            value: ClosedProposalsViewOptions.NetworkGovernance,
                          },
                          {
                            label: t(
                              ClosedProposalsViewOptions.NetworkUpgrades
                            ),
                            value: ClosedProposalsViewOptions.NetworkUpgrades,
                          },
                        ]}
                        checkedValue={closedProposalsView}
                        onChange={(e) =>
                          setClosedProposalsView(
                            e.target.value as ClosedProposalsViewOptions
                          )
                        }
                      />
                    </div>
                  </div>
                )
            }

            <ul data-testid="closed-proposals">
              {closedProposalsView ===
                ClosedProposalsViewOptions.NetworkUpgrades && (
                <div data-testid="closed-upgrade-proposals">
                  {sortedProtocolUpgradeProposals.closed.map((proposal) => (
                    <ProtocolUpgradeProposalsListItem
                      key={proposal.upgradeBlockHeight}
                      proposal={proposal}
                    />
                  ))}
                </div>
              )}

              {closedProposalsView ===
                ClosedProposalsViewOptions.NetworkGovernance && (
                <div data-testid="closed-governance-proposals">
                  {sortedProposals.closed
                    .filter(filterPredicate)
                    .map((proposal) => (
                      <ProposalsListItem
                        key={proposal?.id}
                        proposal={proposal}
                      />
                    ))}
                </div>
              )}
            </ul>
          </>
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
