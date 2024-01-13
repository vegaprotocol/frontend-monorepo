import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  AsyncRenderer,
  Button,
  ExternalLink,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { useRefreshAfterEpoch } from '../../hooks/use-refresh-after-epoch';
import { ProposalsListItem } from '../proposals/components/proposals-list-item';
import { ProtocolUpgradeProposalsListItem } from '../proposals/components/protocol-upgrade-proposals-list-item/protocol-upgrade-proposals-list-item';
import Routes from '../routes';
import { ExternalLinks, useFeatureFlags } from '@vegaprotocol/environment';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useNodesQuery } from '../staking/home/__generated__/Nodes';
import { useProposalsQuery } from '../proposals/proposals/__generated__/Proposals';
import {
  getNotRejectedProposals,
  getNotRejectedProtocolUpgradeProposals,
} from '../proposals/proposals/proposals-container';
import { Heading, SubHeading } from '../../components/heading';
import * as Schema from '@vegaprotocol/types';
import type { RouteChildProps } from '..';
import type { NodesFragmentFragment } from '../staking/home/__generated__/Nodes';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { useProtocolUpgradeProposalsQuery } from '@vegaprotocol/proposals';
import {
  orderByDate,
  orderByUpgradeBlockHeight,
} from '../proposals/components/proposals-list/proposals-list';
import { BigNumber } from '../../lib/bignumber';
import type { ProposalQuery } from '../proposals/proposal/__generated__/Proposal';

const nodesToShow = 6;

const HomeProposals = ({
  proposals,
  protocolUpgradeProposals,
}: {
  proposals: Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }>[];
  protocolUpgradeProposals: ProtocolUpgradeProposalFieldsFragment[];
}) => {
  const { t } = useTranslation();

  return (
    <section className="mb-16 break-all" data-testid="home-proposals">
      <Heading title={t('vegaGovernance')} />
      <h3 className="mb-6">{t('homeProposalsIntro')}</h3>
      <div className="mb-8">
        <ExternalLink href={ExternalLinks.GOVERNANCE_PAGE}>
          {t(`readMoreGovernance`)}
        </ExternalLink>
      </div>

      <SubHeading title={t('latestProposals')} />
      <ul data-testid="home-proposal-list" className="grid gap-6">
        {protocolUpgradeProposals.map((proposal, index) => (
          <ProtocolUpgradeProposalsListItem key={index} proposal={proposal} />
        ))}

        {proposals.map(
          (proposal) =>
            proposal?.id && (
              <ProposalsListItem key={proposal.id} proposal={proposal} />
            )
        )}
      </ul>

      <div className="mt-6">
        <Link to={`${Routes.PROPOSALS}`}>
          <Button size="md">{t('homeProposalsButtonText')}</Button>
        </Link>
      </div>
    </section>
  );
};

interface HomeNodesProps {
  activeNodes: NodesFragmentFragment[];
  consensusNodes: NodesFragmentFragment[];
  trimmedActiveNodes: NodesFragmentFragment[];
}

const HomeNodes = ({
  activeNodes,
  consensusNodes,
  trimmedActiveNodes,
}: HomeNodesProps) => {
  const { t } = useTranslation();

  const highlightedNodeData = [
    { title: t('activeNodes'), length: activeNodes.length },
    { title: t('consensusNodes'), length: consensusNodes.length },
  ];

  return (
    <section className="mb-12" data-testid="home-validators">
      <Heading title={t('Validators')} />
      <h3 className="mb-6">{t('homeValidatorsIntro')}</h3>
      <div className="flex items-center mb-8 gap-8">
        <Link to={Routes.VALIDATORS}>
          <Button size="md">{t('homeValidatorsButtonText')}</Button>
        </Link>

        <ExternalLink href={ExternalLinks.VALIDATOR_FORUM}>
          {t(`readMoreValidators`)}
        </ExternalLink>
      </div>
      <div className="grid grid-cols-[repeat(6,_1fr)] items-center gap-x-6 gap-y-2">
        {highlightedNodeData.map(({ title, length }, index) => (
          <div key={index} className="col-span-3">
            <Link to={Routes.VALIDATORS}>
              <RoundedWrapper paddingBottom={true}>
                <div
                  data-testid="node-information"
                  className="flex flex-col items-center m-[-1rem] px-4 py-6 hover:bg-neutral-800"
                >
                  <span className="text-5xl">{length}</span>
                  <span className="text-sm uppercase text-neutral-400">
                    {title}
                  </span>
                </div>
              </RoundedWrapper>
            </Link>
          </div>
        ))}

        {trimmedActiveNodes.map(({ id, avatarUrl, name }) => (
          <div key={id} data-testid="validators" className="col-span-2">
            <ValidatorDetailsLink id={id} avatarUrl={avatarUrl} name={name} />
          </div>
        ))}
      </div>

      {activeNodes.length > nodesToShow && (
        <Link to={Routes.VALIDATORS}>
          <span className="underline">
            And {activeNodes.length - nodesToShow} more...
          </span>
        </Link>
      )}
    </section>
  );
};

interface ValidatorDetailsLinkProps {
  id: string;
  avatarUrl: string | null | undefined;
  name: string;
}

export const ValidatorDetailsLink = ({
  id,
  avatarUrl,
  name,
}: ValidatorDetailsLinkProps) => {
  return (
    <Link to={`${Routes.VALIDATORS}/${id}`}>
      <RoundedWrapper paddingBottom={true} border={false}>
        <div className="flex items-center justify-center m-[-1rem] p-3 bg-neutral-900 hover:bg-neutral-800">
          {avatarUrl && (
            <img
              className="h-6 w-6 rounded-full mr-2"
              src={avatarUrl}
              alt={`Avatar icon for ${name}`}
            />
          )}
          <span className="text-sm">{name}</span>
        </div>
      </RoundedWrapper>
    </Link>
  );
};

const GovernanceHome = ({ name }: RouteChildProps) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  useDocumentTitle(name);
  const { t } = useTranslation();
  const {
    data: proposalsData,
    loading: proposalsLoading,
    error: proposalsError,
  } = useProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: {
      includeNewMarketProductFields: !!featureFlags.PRODUCT_PERPETUALS,
      includeUpdateMarketStates: !!featureFlags.UPDATE_MARKET_STATE,
      includeUpdateReferralPrograms: !!featureFlags.REFERRALS,
    },
  });

  const {
    data: protocolUpgradesData,
    loading: protocolUpgradesLoading,
    error: protocolUpgradesError,
  } = useProtocolUpgradeProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const {
    data: validatorsData,
    error: validatorsError,
    loading: validatorsLoading,
    refetch,
  } = useNodesQuery();

  useRefreshAfterEpoch(validatorsData?.epoch.timestamps.expiry, refetch);

  const proposals = useMemo(
    () =>
      proposalsData
        ? getNotRejectedProposals(
            removePaginationWrapper(proposalsData.proposalsConnection?.edges)
          )
        : [],
    [proposalsData]
  );

  const sortedProposals = useMemo(
    () => orderByDate(proposals).reverse(),
    [proposals]
  );

  const protocolUpgradeProposals = useMemo(
    () =>
      protocolUpgradesData
        ? getNotRejectedProtocolUpgradeProposals(
            protocolUpgradesData.protocolUpgradeProposals
          ).filter(
            (p) =>
              Number(p.upgradeBlockHeight) >
              Number(protocolUpgradesData.lastBlockHeight)
          )
        : [],
    [protocolUpgradesData]
  );

  const sortedProtocolUpgradeProposals = useMemo(
    () => orderByUpgradeBlockHeight(protocolUpgradeProposals),
    [protocolUpgradeProposals]
  );

  const totalProposalsDesired = 3;
  const protocolUpgradeProposalsToShow = sortedProtocolUpgradeProposals.slice(
    0,
    totalProposalsDesired
  );
  const proposalsToShow =
    protocolUpgradeProposalsToShow.length === totalProposalsDesired
      ? []
      : sortedProposals.slice(
          0,
          totalProposalsDesired - protocolUpgradeProposalsToShow.length
        );

  const activeNodes = removePaginationWrapper(
    validatorsData?.nodesConnection.edges
  ).filter((node) =>
    new BigNumber(node.rankingScore.performanceScore).isGreaterThan(0)
  );

  const trimmedActiveNodes = activeNodes?.slice(0, nodesToShow);

  const consensusNodes = activeNodes.filter(
    (node) =>
      node.rankingScore.status ===
      Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT
  );

  return (
    <AsyncRenderer
      loading={proposalsLoading || protocolUpgradesLoading || validatorsLoading}
      error={proposalsError || protocolUpgradesError || validatorsError}
      data={proposalsData && protocolUpgradesData && validatorsData}
    >
      <HomeProposals
        proposals={proposalsToShow}
        protocolUpgradeProposals={protocolUpgradeProposalsToShow}
      />

      <HomeNodes
        activeNodes={activeNodes}
        consensusNodes={consensusNodes}
        trimmedActiveNodes={trimmedActiveNodes}
      />

      <section className="flex justify-between flex-wrap gap-12 mb-16">
        <div className="min-w-[360px] flex-1" data-testid="home-rewards">
          <Heading title={t('Rewards')} marginTop={false} />
          <h3 className="mb-6">{t('homeRewardsIntro')}</h3>
          <div className="flex items-center mb-8 gap-4">
            <Link to={Routes.REWARDS}>
              <Button size="md">{t('homeRewardsButtonText')}</Button>
            </Link>
          </div>
        </div>

        <div className="min-w-[360px] flex-1" data-testid="home-vega-token">
          <Heading title={t('vegaToken')} marginTop={false} />
          <h3 className="mb-6">{t('homeVegaTokenIntro')}</h3>
          <div className="flex items-center mb-8 gap-4">
            <Link to={Routes.WITHDRAWALS}>
              <Button size="md">{t('homeVegaTokenButtonText')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </AsyncRenderer>
  );
};

export default GovernanceHome;
