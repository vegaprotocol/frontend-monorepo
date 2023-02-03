import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { components } from '../../../../../types/explorer';

interface StateVariableProposalUnknownProps {
  kvb: readonly components['schemas']['vegaKeyValueBundle'][];
}

/**
 * State Variable proposals of an unknown type. Let's just dump
 * it out.
 */
export const StateVariableProposalUnknown = ({
  kvb,
}: StateVariableProposalUnknownProps) => {
  return <SyntaxHighlighter data={kvb} />;
};
