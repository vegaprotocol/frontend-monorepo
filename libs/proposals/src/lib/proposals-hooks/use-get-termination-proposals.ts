import { useDataProvider } from '@vegaprotocol/data-provider';
import { proposalTerminateDataProvider } from '../proposals-data-provider';

export const useGetTerminationProposals = ({
  skip = false,
}: {
  skip?: boolean;
}) => {
  const { data } = useDataProvider({
    dataProvider: proposalTerminateDataProvider,
    skip,
    variables: undefined,
  });
  return (data || []).filter(
    (item) => item.terms.change.__typename === 'UpdateMarketState'
  );
};
