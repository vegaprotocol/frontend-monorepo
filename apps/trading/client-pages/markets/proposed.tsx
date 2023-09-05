import { ProposalsList } from '@vegaprotocol/proposals';
import { SuccessorMarketRenderer } from './successor-market-cell';

export const Proposed = () => {
  return <ProposalsList SuccessorMarketRenderer={SuccessorMarketRenderer} />;
};
