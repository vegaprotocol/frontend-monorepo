import {
  useExplorerProposalQuery,
  type ExplorerProposalQuery,
} from './__generated__/Proposal';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ENV } from '../../../config/env';
import Hash from '../hash';

export type ProposalLinkProps = {
  id: string;
  text?: string;
};

/**
 * Given a proposal ID, generates an external link over to
 * the Governance page for more information
 */
const ProposalLink = ({ id, text }: ProposalLinkProps) => {
  const { data } = useExplorerProposalQuery({
    variables: { id },
  });

  const proposal = data?.proposal as Extract<
    ExplorerProposalQuery['proposal'],
    { __typename?: 'Proposal' }
  >;

  const base = ENV.dataSources.governanceUrl;
  const label = proposal?.rationale.title || id;

  return (
    <ExternalLink href={`${base}/proposals/${id}`}>
      {text ? text : <Hash text={label} />}
    </ExternalLink>
  );
};

export default ProposalLink;
