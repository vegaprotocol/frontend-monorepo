import type { ReactNode } from 'react';

interface ProposalFormSubheaderProps {
  children: ReactNode;
}

export const ProposalFormSubheader = ({
  children,
}: ProposalFormSubheaderProps) => <h2 className="mt-8 mb-4">{children}</h2>;
