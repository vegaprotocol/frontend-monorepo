import { ProposalsList } from '@vegaprotocol/proposals';
import { ParentMarketCell } from './parent-market-cell';

const cellRenderers = {
  ParentMarketCell,
};

export const Proposed = () => {
  return <ProposalsList cellRenderers={cellRenderers} />;
};
