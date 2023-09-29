import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketViewProposalsDataProvider } from '../proposals-data-provider';
import type * as Types from '@vegaprotocol/types';

export const useMarketViewProposals = ({
  skip = false,
  typename,
  proposalType,
  inState,
}: {
  typename: Types.ProposalChange['__typename']
  skip?: boolean;
  inState: Types.ProposalState;
  proposalType?: Types.ProposalType;
}) => {
  const variables = {
    inState,
    ...(proposalType ? { proposalType } : null),
  };

  const { data } = useDataProvider({
    dataProvider: marketViewProposalsDataProvider,
    skip,
    variables,
  });
  return (data || []).filter(
    (item) => item.terms.change.__typename === typename
  );
};
