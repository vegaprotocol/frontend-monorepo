import type { components } from '../../../../../types/explorer';
import { StateVariableProposalUnknown } from './unknown';
import { StateVariableProposalBoundFactors } from './bound-factors';
import { StateVariableProposalRiskFactors } from './risk-factors';

interface StateVariableProposalWrapperProps {
  stateVariable: string | undefined;
  kvb: readonly components['schemas']['vegaKeyValueBundle'][] | undefined;
}

/**
 * State Variable proposals
 */
export const StateVariableProposalWrapper = ({
  stateVariable,
  kvb,
}: StateVariableProposalWrapperProps) => {
  if (!stateVariable || !kvb || kvb.length === 0) {
    return null;
  }

  if (stateVariable.indexOf('bound-factors') !== -1) {
    return <StateVariableProposalBoundFactors kvb={kvb} />;
  } else if (stateVariable.indexOf('risk-factors') !== -1) {
    return <StateVariableProposalRiskFactors kvb={kvb} />;
  } else if (stateVariable.indexOf('probability_of_trading') !== -1) {
    return <StateVariableProposalRiskFactors kvb={kvb} />;
  } else {
    return <StateVariableProposalUnknown kvb={kvb} />;
  }
};
