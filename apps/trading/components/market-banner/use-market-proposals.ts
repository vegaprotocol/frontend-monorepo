import {
  useMarketProposals,
  type ProposalFragment,
} from '@vegaprotocol/proposals';
import { ProposalState, ProposalType } from '@vegaprotocol/types';

const isPending = (p: ProposalFragment) => {
  return [ProposalState.STATE_OPEN, ProposalState.STATE_PASSED].includes(
    p.state
  );
};

export const useUpdateMarketStateProposals = (
  marketId: string,
  inState?: ProposalState
) => {
  const { data, error, loading } = useMarketProposals({
    proposalType: ProposalType.TYPE_UPDATE_MARKET_STATE,
    inState,
  });

  const proposals = data
    ? data.filter(isPending).filter((p) => {
        const change = p.terms?.change;

        if (
          change &&
          change.__typename === 'UpdateMarketState' &&
          change.market.id === marketId
        ) {
          return true;
        }

        return false;
      })
    : [];

  return { data, error, loading, proposals };
};

export const useUpdateMarketProposals = (
  marketId: string,
  inState?: ProposalState
) => {
  const { data, error, loading } = useMarketProposals({
    proposalType: ProposalType.TYPE_UPDATE_MARKET,
    inState,
  });

  const proposals = data
    ? data.filter(isPending).filter((p) => {
        const change = p.terms?.change;
        if (
          change &&
          change.__typename === 'UpdateMarket' &&
          change.marketId === marketId
        ) {
          return true;
        }
        return false;
      })
    : [];

  return { data, error, loading, proposals };
};

export const useSuccessorMarketProposals = (
  marketId: string,
  inState?: ProposalState
) => {
  const { data, loading, error } = useMarketProposals({
    proposalType: ProposalType.TYPE_NEW_MARKET,
    inState,
  });

  const proposals = data
    ? data.filter(isPending).filter((p) => {
        const change = p.terms?.change;
        if (
          change &&
          change.__typename === 'NewMarket' &&
          change.successorConfiguration?.parentMarketId === marketId
        ) {
          return true;
        }
        return false;
      })
    : [];

  return { data, error, loading, proposals };
};
