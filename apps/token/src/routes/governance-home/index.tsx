import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AsyncRenderer, Button, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { useQuery } from '@apollo/client';
import type { Proposals } from '../governance/proposals/__generated__/Proposals';
import { getNotRejectedProposals } from '@vegaprotocol/governance';
import { ProposalsListItem } from '../governance/components/proposals-list-item';
import { PROPOSALS_QUERY } from '../governance/proposals';
import type { Proposal_proposal } from '../governance/proposal/__generated__/Proposal';
import Routes from '../routes';
import {
  ExternalLinks,
  removePaginationWrapper,
} from '@vegaprotocol/react-helpers';
import { useNodesQuery } from '../staking/home/__generated___/Nodes';
import { Schema } from '@vegaprotocol/types';
import { ValidatorRenderer } from '../staking/home/validator-tables/shared';

const GovernanceHome = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const {
    data: proposalsData,
    loading: proposalsLoading,
    error: proposalsError,
  } = useQuery<Proposals>(PROPOSALS_QUERY, {
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

  useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!validatorsData?.epoch.timestamps.expiry) return;
      const now = Date.now();
      const expiry = new Date(validatorsData.epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [refetch, validatorsData?.epoch.timestamps.expiry]);

  const proposals = useMemo(
    () => getNotRejectedProposals(proposalsData).slice(0, 3),
    [proposalsData]
  );

  const activeNodes = removePaginationWrapper(
    validatorsData?.nodesConnection.edges
  );

  const consensusNodes = activeNodes.filter(
    (node) =>
      node.rankingScore.status ===
      Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT
  );

  return (
    <AsyncRenderer
      loading={proposalsLoading || validatorsLoading}
      error={proposalsError || validatorsError}
      data={proposalsData && validatorsData}
    >
      {proposalsData && (
        <section className="mb-16" data-testid="governance-home-proposals">
          <h2 className="text-2xl font-bold mb-4">{t('Proposals')}</h2>
          <h3 className="mb-6">
            {t(
              'Decisions on the Vega network are on-chain, with tokenholders creating proposals that other tokenholders vote to approve or reject.'
            )}
          </h3>
          <div className="flex items-center mb-6 gap-4">
            <Link to={`${Routes.GOVERNANCE}/proposals}`}>
              <Button size="md">{t('Browse, vote, and propose')}</Button>
            </Link>

            <ExternalLink href={ExternalLinks.GOVERNANCE_PAGE}>
              {t(`Read more about Vega governance`)}
            </ExternalLink>
          </div>
          <ul data-testid="governance-home-proposal-list">
            {proposals.map((proposal: Proposal_proposal) => (
              <ProposalsListItem key={proposal.id} proposal={proposal} />
            ))}
          </ul>
        </section>
      )}
      {validatorsData && (
        <section className="mb-16" data-testid="governance-home-validators">
          <h2 className="text-2xl font-bold mb-4">{t('Validators')}</h2>
          <h3 className="mb-6">
            {t(
              'Vega runs on a delegated proof of stake blockchain, where validators earn fees for validating block transactions. Tokenholders can nominate validators by staking tokens to them.'
            )}
          </h3>
          <div className="flex items-center mb-8 gap-4">
            <Link to={Routes.STAKING}>
              <Button size="md">{t('Browse and stake')}</Button>
            </Link>

            <ExternalLink href={ExternalLinks.VALIDATOR_FORUM}>
              {t(`Read more about validators`)}
            </ExternalLink>
          </div>
          <div className="grid grid-cols-[1fr_1fr] items-center gap-12 my-6">
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-light">
                  {activeNodes.length}
                </span>
                <span className="text-sm">{t('active nodes')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-light">
                  {consensusNodes.length}
                </span>
                <span className="text-sm">{t('consensus nodes')}</span>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-4">
              {activeNodes.map(({ id, avatarUrl, name }) => (
                <div key={id} className="flex">
                  {avatarUrl && (
                    <img
                      className="h-6 w-6 rounded-full mr-2"
                      src={avatarUrl}
                      alt={`Avatar icon for ${name}`}
                    />
                  )}
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section
        data-testid="governance-home-quick-links"
        className="grid grid-cols-2 gap-12 mb-16"
      >
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('Rewards')}</h2>
          <h3 className="mb-6">
            {t(
              "Track rewards you've earned for trading, liquidity provision, market creation, and staking."
            )}
          </h3>
          <div className="flex items-center mb-8 gap-4">
            <Link to={Routes.REWARDS}>
              <Button size="md">{t('See rewards')}</Button>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">{t('VEGA Token')}</h2>
          <h3 className="mb-6">
            {t(
              'VEGA Token is a governance asset used to make and vote on proposals, and nominate validators.'
            )}
          </h3>
          <div className="flex items-center mb-8 gap-4">
            <Link to={Routes.WITHDRAWALS}>
              <Button size="md">{t('See rewards')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </AsyncRenderer>
  );
};

export default GovernanceHome;
