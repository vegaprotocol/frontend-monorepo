import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { getProposals, useProposalsQuery } from '@vegaprotocol/governance';

const Governance = () => {
  const { data } = useProposalsQuery();
  const proposals = getProposals(data);

  if (!data) return null;
  return (
    <section>
      <RouteTitle data-testid="governance-header">
        {t('Governance Proposals')}
      </RouteTitle>
      {proposals.map((p) => (
        <React.Fragment key={p.id}>
          <SubHeading>{p.rationale.title}</SubHeading>
          <SyntaxHighlighter data={p} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Governance;
