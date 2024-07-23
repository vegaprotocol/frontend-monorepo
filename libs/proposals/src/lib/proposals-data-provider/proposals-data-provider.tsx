import { useDataProvider, type Update } from '@vegaprotocol/data-provider';
import { makeDataProvider } from '@vegaprotocol/data-provider';
import produce from 'immer';
import * as Types from '@vegaprotocol/types';
import {
  MarketViewLiveProposalsDocument,
  MarketViewProposalsDocument,
  ProposalsListDocument,
  type ProposalsListQuery,
  type ProposalsListQueryVariables,
  type ProposalListFieldsFragment,
  type MarketViewLiveProposalsSubscription,
  type MarketViewProposalFieldsFragment,
  type MarketViewProposalsQuery,
  type MarketViewProposalsQueryVariables,
  type MarketViewLiveProposalsSubscriptionVariables,
  type SubProposalFragment,
  type BatchproposalListFieldsFragment,
} from './__generated__/Proposals';

export type ProposalFragment =
  | MarketViewProposalFieldsFragment
  | SubProposalFragment;
export type ProposalFragments = Array<ProposalFragment>;

const getData = (responseData: ProposalsListQuery | null) =>
  responseData?.proposalsConnection?.edges
    ?.filter((edge) => Boolean(edge?.proposalNode))
    .map(
      (edge) =>
        edge?.proposalNode as
          | ProposalListFieldsFragment
          | BatchproposalListFieldsFragment
    ) || null;

export const proposalsDataProvider = makeDataProvider<
  ProposalsListQuery,
  Array<ProposalListFieldsFragment | BatchproposalListFieldsFragment>,
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
  errorPolicy: 'all',
});

const ProposalTypeMap: Record<
  Types.ProposalType,
  Types.ProposalChange['__typename']
> = {
  [Types.ProposalType.TYPE_CANCEL_TRANSFER]: 'CancelTransfer',
  [Types.ProposalType.TYPE_NETWORK_PARAMETERS]: 'UpdateNetworkParameter',
  [Types.ProposalType.TYPE_NEW_ASSET]: 'NewAsset',
  [Types.ProposalType.TYPE_NEW_FREE_FORM]: 'NewFreeform',
  [Types.ProposalType.TYPE_NEW_MARKET]: 'NewMarket',
  [Types.ProposalType.TYPE_NEW_SPOT_MARKET]: 'NewSpotMarket',
  [Types.ProposalType.TYPE_NEW_TRANSFER]: 'NewTransfer',
  [Types.ProposalType.TYPE_UPDATE_ASSET]: 'UpdateAsset',
  [Types.ProposalType.TYPE_UPDATE_MARKET]: 'UpdateMarket',
  [Types.ProposalType.TYPE_UPDATE_MARKET_STATE]: 'UpdateMarketState',
  [Types.ProposalType.TYPE_UPDATE_REFERRAL_PROGRAM]: 'UpdateReferralProgram',
  [Types.ProposalType.TYPE_UPDATE_SPOT_MARKET]: 'UpdateSpotMarket',
  [Types.ProposalType.TYPE_UPDATE_VOLUME_DISCOUNT_PROGRAM]:
    'UpdateVolumeDiscountProgram',
};

const matchFilter = (
  data: ProposalFragment,
  variables: MarketViewProposalsQueryVariables
) => {
  return (
    (!variables.inState || data.state === variables.inState) &&
    (!variables.proposalType ||
      data.terms?.change.__typename === ProposalTypeMap[variables.proposalType])
  );
};

export const update: Update<
  ProposalFragment[] | null,
  ProposalFragment,
  MarketViewProposalsQueryVariables
> = (
  data: ProposalFragment[] | null,
  delta: ProposalFragment,
  reload,
  variables
) => {
  const updateData = produce(data || [], (draft) => {
    const { id } = delta;
    const index = draft.findIndex((item) => item.id === id);
    const match = matchFilter(delta, variables);
    if (index === -1) {
      if (match) {
        draft.unshift(delta);
      }
    } else {
      if (match) {
        draft[index] = delta;
      } else {
        draft.splice(index, 1);
      }
    }
  });
  return updateData;
};

const getMarketProposalsData = (
  responseData: MarketViewProposalsQuery | null
): ProposalFragments => {
  const proposals: ProposalFragment[] = [];
  responseData?.proposalsConnection?.edges?.forEach((edge) => {
    if (edge?.proposalNode) {
      if (edge.proposalNode.__typename === 'Proposal') {
        proposals.push(edge.proposalNode);
      } else if (
        edge.proposalNode.__typename === 'BatchProposal' &&
        edge.proposalNode.subProposals
      ) {
        proposals.push(
          ...(edge.proposalNode.subProposals as ProposalFragments)
        );
      }
    }
  });
  return proposals;
};

const subscriptionVariables: MarketViewLiveProposalsSubscriptionVariables = {};

export const marketViewProposalsDataProvider = makeDataProvider<
  MarketViewProposalsQuery,
  ProposalFragments,
  MarketViewLiveProposalsSubscription,
  MarketViewProposalFieldsFragment,
  MarketViewProposalsQueryVariables,
  MarketViewLiveProposalsSubscriptionVariables
>({
  query: MarketViewProposalsDocument,
  subscriptionQuery: MarketViewLiveProposalsDocument,
  update,
  getDelta: (subscriptionData: MarketViewLiveProposalsSubscription) =>
    subscriptionData.proposals,
  getData: getMarketProposalsData,
  getSubscriptionVariables: () => subscriptionVariables,
});

export const useMarketProposals = (
  variables: {
    inState?: Types.ProposalState;
    proposalType?: Types.ProposalType;
  },
  skip?: boolean
) => {
  return useDataProvider({
    dataProvider: marketViewProposalsDataProvider,
    variables,
    skip,
  });
};
