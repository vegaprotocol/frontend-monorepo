import { makeDataProvider } from '@vegaprotocol/data-provider';
import produce from 'immer';
import type {
  ProposalsListQuery,
  ProposalsListQueryVariables,
  ProposalListFieldsFragment,
  MarketViewLiveProposalsSubscription,
  MarketViewProposalFieldsFragment,
  MarketViewProposalsQuery,
  MarketViewProposalsQueryVariables,
} from './__generated__/Proposals';
import {
  MarketViewLiveProposalsDocument,
  MarketViewProposalsDocument,
  ProposalsListDocument,
} from './__generated__/Proposals';
import { removePaginationWrapper } from '@vegaprotocol/utils';

const getData = (responseData: ProposalsListQuery | null) =>
  responseData?.proposalsConnection?.edges
    ?.filter((edge) => Boolean(edge?.node))
    .map((edge) => edge?.node as ProposalListFieldsFragment) || null;

export const proposalsDataProvider = makeDataProvider<
  ProposalsListQuery,
  ProposalListFieldsFragment[],
  never,
  never,
  ProposalsListQueryVariables
>({
  query: ProposalsListDocument,
  getData,
  /**
   * Ignores errors for not found settlement asset for NewMarket proposals.
   *
   * It can happen that a NewMarket proposal is incomplete and does not contain
   * `futureProduct` details. This guard protects against that.
   *
   * GQL Path: `terms.change.instrument.futureProduct.settlementAsset`
   */
  errorPolicyGuard: (errors) =>
    errors.every((e) => e.message.match(/failed to get asset for ID/)),
});

const update = (
  data: MarketViewProposalFieldsFragment[] | null,
  delta: MarketViewProposalFieldsFragment
) => {
  const updateData = produce(data || [], (draft) => {
    const { id } = delta;
    const index = draft.findIndex((item) => item.id === id);
    if (index === -1) {
      draft.unshift(delta);
    } else {
      const currNode = draft[index];
      draft[index] = {
        ...currNode,
        ...delta,
      };
    }
  });
  return updateData;
};

const getMarketProposalsData = (
  responseData: MarketViewProposalsQuery | null
) => removePaginationWrapper(responseData?.proposalsConnection?.edges) || [];

export const marketViewProposalsDataProvider = makeDataProvider<
  MarketViewProposalsQuery,
  MarketViewProposalFieldsFragment[],
  MarketViewLiveProposalsSubscription,
  MarketViewProposalFieldsFragment,
  MarketViewProposalsQueryVariables
>({
  query: MarketViewProposalsDocument,
  subscriptionQuery: MarketViewLiveProposalsDocument,
  update,
  getDelta: (subscriptionData: MarketViewLiveProposalsSubscription) =>
    subscriptionData.proposals,
  getData: getMarketProposalsData,
});
