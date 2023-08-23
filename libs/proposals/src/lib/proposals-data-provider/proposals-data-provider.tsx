import { makeDataProvider } from '@vegaprotocol/data-provider';
import type {
  ProposalsListQuery,
  ProposalsListQueryVariables,
  ProposalListFieldsFragment,
} from './__generated__/Proposals';
import { ProposalsListDocument } from './__generated__/Proposals';

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
