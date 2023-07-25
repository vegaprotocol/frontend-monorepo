import {
  useSuccessorMarketIdQuery,
  useSuccessorMarketQuery,
} from '../__generated__';

export const useSuccessorMarket = (marketId?: string) => {
  const {
    data: idData,
    loading: idLoading,
    error: idError,
  } = useSuccessorMarketIdQuery({
    variables: {
      marketId: marketId || '',
    },
    skip: !marketId,
  });
  const successorMarketId = idData?.market?.successorMarketID;
  const { data, loading, error } = useSuccessorMarketQuery({
    variables: {
      marketId: successorMarketId || '',
    },
    skip: !successorMarketId,
  });
  const successorData = data?.market;
  return {
    data: successorData,
    loading: loading || idLoading,
    error: error || idError,
  };
};
