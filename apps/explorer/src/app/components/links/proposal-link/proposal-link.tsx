import { useExplorerProposalQuery } from './__generated__/Proposal';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ENV } from '../../../config/env';
import Hash from '../hash';
export type ProposalLinkProps = {
  id: string;
};

/**
 * Given a proposal ID, generates an external link over to
 * the Governance page for more information
 */
const ProposalLink = ({ id }: ProposalLinkProps) => {
  const { data } = useExplorerProposalQuery({
    variables: { id },
  });

  const base = ENV.dataSources.governanceUrl;
  const label = data?.proposal?.rationale.title || id;

  return (
    <ExternalLink href={`${base}/proposals/${id}`}>
      <Hash text={label} />
    </ExternalLink>
  );
};

export default ProposalLink;
