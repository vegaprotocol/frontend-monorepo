import { ProposalsList } from './proposals-list';
import { ParentMarketCell } from './parent-market-cell';

const cellRenderers = {
  ParentMarketCell,
};

export const Proposed = () => {
  return <ProposalsList cellRenderers={cellRenderers} />;
};
